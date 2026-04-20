namespace backend.Features.Masters.Ledgers;

public sealed record CreateLedgerGroupRequest(
    string Code,
    string Name,
    string Nature,
    Guid? ParentGroupId,
    string? Status);

public sealed record UpdateLedgerGroupRequest(
    string Code,
    string Name,
    string Nature,
    Guid? ParentGroupId,
    string? Status);
