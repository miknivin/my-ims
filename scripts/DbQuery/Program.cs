using System.Text.Json;
using Npgsql;

var settingsPath = Path.GetFullPath(
    Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "backend", "appsettings.Development.json"));

if (!File.Exists(settingsPath))
{
    Console.Error.WriteLine($"Settings not found: {settingsPath}");
    return 1;
}

using var doc = JsonDocument.Parse(File.ReadAllText(settingsPath));
var cs = doc.RootElement
    .GetProperty("ConnectionStrings")
    .GetProperty("DefaultConnection")
    .GetString()!;

var builder = new NpgsqlConnectionStringBuilder();
foreach (var part in cs.Split(';', StringSplitOptions.RemoveEmptyEntries))
{
    var eq = part.IndexOf('=');
    if (eq == -1) continue;
    var key = part[..eq].Trim().ToLower();
    var val = part[(eq + 1)..].Trim();
    switch (key)
    {
        case "host":     builder.Host = val; break;
        case "port":     builder.Port = int.Parse(val); break;
        case "database": builder.Database = val; break;
        case "username": builder.Username = val; break;
        case "password": builder.Password = val; break;
    }
}

await using var conn = new NpgsqlConnection(builder.ConnectionString);
await conn.OpenAsync();
Console.WriteLine($"Connected to {builder.Database}@{builder.Host}:{builder.Port}\n");

string? sqlArg = null;

if (args.Length >= 2 && args[0] == "-f")
{
    sqlArg = File.ReadAllText(args[1]).Trim();
}
else if (args.Length > 0)
{
    sqlArg = string.Join(" ", args);
}

if (sqlArg is not null)
{
    await RunQuery(conn, sqlArg);
    return 0;
}

// Interactive mode
Console.WriteLine("Interactive mode — type SQL and press Enter. Type 'exit' to quit.\n");
while (true)
{
    Console.Write("sql> ");
    var line = Console.ReadLine()?.Trim();
    if (string.IsNullOrEmpty(line) || line.Equals("exit", StringComparison.OrdinalIgnoreCase))
        break;
    await RunQuery(conn, line);
}

return 0;

static async Task RunQuery(NpgsqlConnection conn, string sql)
{
    try
    {
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        if (!reader.HasRows && reader.FieldCount == 0)
        {
            Console.WriteLine($"OK — {reader.RecordsAffected} row(s) affected\n");
            return;
        }

        var cols = Enumerable.Range(0, reader.FieldCount)
            .Select(i => reader.GetName(i))
            .ToList();

        var rows = new List<string[]>();
        while (await reader.ReadAsync())
        {
            rows.Add(Enumerable.Range(0, reader.FieldCount)
                .Select(i => reader.IsDBNull(i) ? "NULL" : reader.GetValue(i)?.ToString() ?? "")
                .ToArray());
        }

        var widths = cols.Select((col, i) =>
            Math.Max(col.Length, rows.Count > 0 ? rows.Max(r => r[i].Length) : 0)).ToList();

        var header = string.Join(" | ", cols.Select((col, i) => col.PadRight(widths[i])));
        var sep = string.Join("-+-", widths.Select(w => new string('-', w)));

        Console.WriteLine(header);
        Console.WriteLine(sep);
        foreach (var row in rows)
            Console.WriteLine(string.Join(" | ", row.Select((val, i) => val.PadRight(widths[i]))));

        Console.WriteLine($"\n({rows.Count} row{(rows.Count == 1 ? "" : "s")})\n");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Error: {ex.Message}\n");
    }
}
