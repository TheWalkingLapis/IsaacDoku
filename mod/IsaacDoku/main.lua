local json = require("json")

---@type ModReference
local mod = RegisterMod("IsaacDoku", 1)

local jsonItems = {}

for name, id in pairs(CollectibleType) do
    local item = Isaac.GetItemConfig():GetCollectible(id)
    if item ~= nil then
        -- Name and Description are both referencing the stringtable.sta file
        local itemDump = {
            AchievementID = item.AchievementID,
            AddBlackHearts = item.AddBlackHearts,
            AddBombs = item.AddBombs,
            AddCoins = item.AddCoins,
            AddCostumeOnPickup = item.AddCostumeOnPickup,
            AddHearts = item.AddHearts,
            AddKeys = item.AddKeys,
            AddMaxHearts = item.AddMaxHearts,
            AddSoulHearts = item.AddSoulHearts,
            CacheFlags = item.CacheFlags,
            ChargeType = item.ChargeType,
            ClearEffectsOnRemove = item.ClearEffectsOnRemove,
            -- Costume = item.Costume,
            CraftingQuality = item.CraftingQuality,
            Description = item.Description,
            DevilPrice = item.DevilPrice,
            Discharged = item.Discharged,
            GfxFileName = item.GfxFileName,
            Hidden = item.Hidden,
            ID = item.ID,
            InitCharge = item.InitCharge,
            MaxCharges = item.MaxCharges,
            MaxCooldown = item.MaxCooldown,
            Name = item.Name,
            PassiveCache = item.PassiveCache,
            PersistentEffect = item.PersistentEffect,
            Quality = item.Quality,
            ShopPrice = item.ShopPrice,
            Special = item.Special,
            Tags = item.Tags,
            Type = ItemType[item.Type]
        }
        table.insert(jsonItems, itemDump)
    end
end

mod:SaveData(json.encode(jsonItems))
