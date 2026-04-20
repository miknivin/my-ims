namespace backend.Features.Masters.Uoms;

public sealed record CreateUomRequest(
    string Code,
    string Name,
    string? Status);

public sealed record UpdateUomRequest(
    string Code,
    string Name,
    string? Status);
