using backend.Features.Masters.Ledgers;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Features.Utils;

public sealed record CodeSuggestion(string Code);

internal static class CodeGeneratorHandler
{
    private sealed record EntityCodeConfig(string Table, string Column, string DefaultPrefix);

    private static readonly Dictionary<string, EntityCodeConfig> Registry = new(StringComparer.OrdinalIgnoreCase)
    {
        ["category"]          = new("categories",          "\"Code\"", "CAT"),
        ["ledger"]            = new("ledgers",            "\"Code\"", "LED"),
        ["ledger-group"]      = new("ledger_groups",      "\"Code\"", "LG"),
        ["customer"]          = new("customers",           "code",     "CUST"),
        ["vendor"]            = new("vendors",             "code",     "VEND"),
        ["product"]           = new("products",            "code",     "PROD"),
        ["tax"]               = new("taxes",               "\"Code\"", "TAX"),
        ["uom"]               = new("uoms",                "\"Code\"", "UOM"),
        ["warehouse"]         = new("warehouses",          "\"Code\"", "WH"),
        ["purchase-order"]    = new("purchase_orders",     "no",       "PO"),
        ["sales-order"]       = new("sales_orders",        "no",       "SO"),
        ["purchase-invoice"]  = new("purchase_invoices",   "no",       "PI"),
        ["sales-invoice"]     = new("sales_invoices",      "no",       "SI"),
        ["goods-receipt"]     = new("goods_receipt_notes", "no",       "GRN"),
        ["delivery-note"]     = new("delivery_notes",      "no",       "DN"),
        ["user"]              = new("users",               "\"EmployeeCode\"", "EMP"),
    };

    internal static async Task<IResult> GenerateAsync(
        string entity,
        string? prefix,
        AppDbContext dbContext,
        CancellationToken cancellationToken)
    {
        if (!Registry.TryGetValue(entity, out var config))
            return TypedResults.BadRequest(new ApiResponse<object>(false, $"Unknown entity '{entity}'.", null));

        var effectivePrefix = string.IsNullOrWhiteSpace(prefix)
            ? config.DefaultPrefix
            : prefix.Trim().ToUpperInvariant();

        var pattern = $"{effectivePrefix}-%";

        var conn = (NpgsqlConnection)dbContext.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync(cancellationToken);

        var sql = $"SELECT {config.Column}::text FROM {config.Table} WHERE {config.Column}::text ILIKE @pattern";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@pattern", pattern);

        var codes = new List<string>();
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            if (!reader.IsDBNull(0))
                codes.Add(reader.GetString(0));
        }

        var maxNumber = codes
            .Select(code =>
            {
                var dash = code.LastIndexOf('-');
                if (dash >= 0 && int.TryParse(code[(dash + 1)..], out var n))
                    return n;
                return 0;
            })
            .DefaultIfEmpty(0)
            .Max();

        var nextCode = $"{effectivePrefix}-{maxNumber + 1:D3}";
        return TypedResults.Ok(new ApiResponse<CodeSuggestion>(true, "Code generated.", new CodeSuggestion(nextCode)));
    }
}
