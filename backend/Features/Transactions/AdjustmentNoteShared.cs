namespace backend.Features.Transactions;

public enum AdjustmentNoteNature
{
    Return = 1,
    RateDifference = 2,
    DiscountAdjustment = 3,
    DamageClaim = 4,
    Other = 5
}

public enum AdjustmentInventoryEffect
{
    None = 1,
    In = 2,
    Out = 3
}

public static class AdjustmentNoteConventions
{
    public static AdjustmentNoteNature ParseNature(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return AdjustmentNoteNature.Other;
        }

        return value.Trim() switch
        {
            "Return" => AdjustmentNoteNature.Return,
            "RateDifference" => AdjustmentNoteNature.RateDifference,
            "DiscountAdjustment" => AdjustmentNoteNature.DiscountAdjustment,
            "DamageClaim" => AdjustmentNoteNature.DamageClaim,
            _ => AdjustmentNoteNature.Other
        };
    }

    public static string ToNatureLabel(AdjustmentNoteNature value) => value switch
    {
        AdjustmentNoteNature.Return => "Return",
        AdjustmentNoteNature.RateDifference => "RateDifference",
        AdjustmentNoteNature.DiscountAdjustment => "DiscountAdjustment",
        AdjustmentNoteNature.DamageClaim => "DamageClaim",
        _ => "Other"
    };

    public static bool AffectsInventory(AdjustmentNoteNature value) =>
        value == AdjustmentNoteNature.Return;

    public static string ToInventoryEffectLabel(AdjustmentInventoryEffect value) =>
        value switch
        {
            AdjustmentInventoryEffect.In => "In",
            AdjustmentInventoryEffect.Out => "Out",
            _ => "None"
        };

    public static AdjustmentInventoryEffect GetSalesCreditInventoryEffect(AdjustmentNoteNature value) =>
        value == AdjustmentNoteNature.Return
            ? AdjustmentInventoryEffect.In
            : AdjustmentInventoryEffect.None;

    public static AdjustmentInventoryEffect GetSalesDebitInventoryEffect(AdjustmentNoteNature value) =>
        AdjustmentInventoryEffect.None;

    public static AdjustmentInventoryEffect GetPurchaseCreditInventoryEffect(AdjustmentNoteNature value) =>
        AdjustmentInventoryEffect.None;

    public static AdjustmentInventoryEffect GetPurchaseDebitInventoryEffect(AdjustmentNoteNature value) =>
        value == AdjustmentNoteNature.Return
            ? AdjustmentInventoryEffect.Out
            : AdjustmentInventoryEffect.None;
}
