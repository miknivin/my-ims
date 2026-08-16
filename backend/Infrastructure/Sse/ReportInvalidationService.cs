using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace backend.Infrastructure.Sse;

public sealed class ReportInvalidationService
{
    private readonly ConcurrentDictionary<Guid, Channel<SseEvent>> _clients = new();

    public async IAsyncEnumerable<SseEvent> SubscribeAsync(
        [EnumeratorCancellation] CancellationToken ct)
    {
        var id = Guid.NewGuid();
        var channel = Channel.CreateBounded<SseEvent>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
        });
        _clients.TryAdd(id, channel);
        try
        {
            await foreach (var evt in channel.Reader.ReadAllAsync(ct))
                yield return evt;
        }
        finally
        {
            _clients.TryRemove(id, out _);
        }
    }

    public void Publish(string[] invalidations)
    {
        if (_clients.IsEmpty) return;
        var evt = new SseEvent(invalidations);
        foreach (var (_, ch) in _clients)
            ch.Writer.TryWrite(evt);
    }
}
