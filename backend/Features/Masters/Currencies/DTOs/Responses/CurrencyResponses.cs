namespace backend.Features.Masters.Currencies;

public sealed record CurrencyDto(
    Guid Id,
    string Code,
    string Name,
    string Symbol,
    string Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static CurrencyDto FromEntity(Currency currency)
    {
        return new CurrencyDto(
            currency.Id,
            currency.Code,
            currency.Name,
            currency.Symbol,
            currency.Status,
            currency.CreatedAtUtc,
            currency.UpdatedAtUtc);
    }
}

public sealed record ApiResponse<T>(bool Success, string Message, T? Data);
