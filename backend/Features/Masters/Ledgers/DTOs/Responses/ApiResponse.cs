namespace backend.Features.Masters.Ledgers;

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
