namespace backend.Features.Masters.Currencies;

public sealed record CreateCurrencyRequest(
    string Code,
    string Name,
    string Symbol,
    string? Status);

public sealed record UpdateCurrencyRequest(
    string Code,
    string Name,
    string Symbol,
    string? Status);
