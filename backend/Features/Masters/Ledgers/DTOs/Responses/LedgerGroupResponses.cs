namespace backend.Features.Masters.Ledgers;

public sealed record LedgerGroupDto(
    Guid Id,
    string Code,
    string Name,
    string Nature,
    Guid? ParentGroupId,
    string? ParentGroupName,
    string Status,
    bool IsSystem,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc)
{
    public static LedgerGroupDto FromEntity(LedgerGroup group)
    {
        return new LedgerGroupDto(
            group.Id,
            group.Code,
            group.Name,
            group.Nature,
            group.ParentGroupId,
            group.ParentGroup?.Name,
            group.Status,
            group.IsSystem,
            group.CreatedAtUtc,
            group.UpdatedAtUtc);
    }
}
