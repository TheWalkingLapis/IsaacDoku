local json = require("json")

---@type ModReference
local mod = RegisterMod("IsaacDoku", 1)

--- reset isaac state as good as possible
local function reset_isaac()
    local player = Isaac.GetPlayer()
    
    -- remove items, then apply item changes
    for i = 1, CollectibleType.NUM_COLLECTIBLES do
        while player:HasCollectible(i) do
            player:RemoveCollectible(i)
        end
    end
    player:AddCacheFlags(CacheFlag.CACHE_ALL)
    player:EvaluateItems()

    -- reset hearts, coins, etc
    player:AddBlackHearts(-player:GetBlackHearts())
    player:AddSoulHearts(-player:GetSoulHearts())
    player:AddEternalHearts(-player:GetEternalHearts())
    player:AddBrokenHearts(-player:GetBrokenHearts())
    player:AddBoneHearts(-player:GetBoneHearts())
    player:AddCoins(-player:GetNumCoins())
    player:AddBombs(-player:GetNumBombs())
    player:AddKeys(-player:GetNumKeys())
    player:AddMaxHearts(-player:GetMaxHearts() + 6, true) -- reset containers to 3 full (=6 half)
    player:AddHearts(player:GetMaxHearts()) -- fullheal


    -- clean room pickups
    for i, entity in ipairs(Isaac.GetRoomEntities()) do
        if entity.Type == 5 then -- Pickups
            -- clean up all pickups
            entity:Remove()
        end
    end
end

--[[
    Side effects:
    - Edens Blessing still grants Items next run after removal

    ! some items register callbacks and whatever, this seems to be incredibly hard or impossible to do automatically
    -> reset runs
]]
local function simulate_item(id)
    local player = Isaac.GetPlayer()

    player:AddCollectible(id)
    player:AddCacheFlags(CacheFlag.CACHE_ALL)
    player:EvaluateItems()
end

local function measure_isaac(defaultValues)
    local player = Isaac.GetPlayer()

    local pickupsRaw = {}
    local pickups = {}
    for i, entity in ipairs(Isaac.GetRoomEntities()) do
        if entity.Type == 5 then -- Pickups
            pickupsRaw[entity.Variant] = (pickupsRaw[entity.Variant] or 0) + 1
            -- clean up all pickups after counting them
            entity:Remove()
        end
    end
    -- convert pickupVariant from int to str
    for variant, count in pairs(pickupsRaw) do
        for key, value in pairs(PickupVariant) do
            if value == variant then
                table.insert(pickups, key) -- only insert type of pickup, not count
            end
        end
    end

    local newData = {
        Coins = player:GetNumCoins(),
        Bombs = player:GetNumBombs(),
        Keys = player:GetNumKeys(),
        Pickups = table.concat(pickups, ","),
        Flight = player.CanFly,
        Tears = 30.0 / (player.MaxFireDelay + 1) - defaultValues.Tears, -- https://moddingofisaac.com/docs/rep/EntityPlayer.html#firedelay
        Damage = player.Damage - defaultValues.Damage,
        Luck = player.Luck - defaultValues.Luck,
        Range = (player.TearRange / 40.0) - defaultValues.Range,
        MoveSpeed = player.MoveSpeed - defaultValues.MoveSpeed,
        ShotSpeed = player.ShotSpeed - defaultValues.ShotSpeed,
        TearFlags = player.TearFlags,
    }

    return newData
end

local function measure_item(id)
    local item = Isaac.GetItemConfig():GetCollectible(id)
    local itemInfo = {}

    local function get_enum_key(value, enum)
        for key, val in pairs(enum) do
            if val == value then
                return key
            end
        end
        return "ITEM_NULL"
    end
    if item ~= nil then
        -- Name and Description are both referencing the stringtable.sta file
        itemInfo = {
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
            Type = get_enum_key(item.Type, ItemType)
        }
    end

    return itemInfo
end

-- write content of enums to file as well to avoid hard coded copies in python/js
local function save_enums()
    local jsonEnums = {
        ItemConfig = {}
    }
    for tag, value in pairs(ItemConfig) do
        if string.sub(tag, 1, 4) == "TAG_" then
            jsonEnums.ItemConfig[tag] = value
        end
    end

    return jsonEnums
end

local function write_results(enums, items)
    mod:SaveData(json.encode({
        enumData = enums,
        itemData = items,
    }))
end

-- Simulate Items

local SimulationState = {
    InitReset = 0,
    InitFinalize = 1,
    ResetIsaac = 2,
    ApplyItem = 3,
    WaitFrame = 4,
    CollectResults = 5,
    Finished = 6,
}

local itemTestQueue = {
    State = SimulationState.InitReset,
    NextItem = CollectibleType.COLLECTIBLE_SAD_ONION,
    Results = {},
}

local function _on_update()
    if itemTestQueue.State == SimulationState.Finished then
        return
    end

    if itemTestQueue.State == SimulationState.InitReset then
        reset_isaac()

        itemTestQueue.State = SimulationState.InitFinalize
    end
    if itemTestQueue.State == SimulationState.InitFinalize then
        local initDefault = {
            Tears = 0,
            Damage = 0,
            Luck = 0,
            Range = 0,
            MoveSpeed = 0,
            ShotSpeed = 0,
        }
        itemTestQueue.DefaultValues = measure_isaac(initDefault)

        itemTestQueue.State = SimulationState.ResetIsaac
    end

    if itemTestQueue.State == SimulationState.ResetIsaac then
        reset_isaac()

        itemTestQueue.State = SimulationState.ApplyItem
    end

    if itemTestQueue.State == SimulationState.ApplyItem then
        simulate_item(itemTestQueue.NextItem)

        itemTestQueue.State = SimulationState.WaitFrame
    end

    if itemTestQueue.State == SimulationState.WaitFrame then
        itemTestQueue.State = SimulationState.CollectResults
    end

    if itemTestQueue.State == SimulationState.CollectResults then
        local itemResults = measure_item(itemTestQueue.NextItem)
        local isaacResults = measure_isaac(itemTestQueue.DefaultValues)
        if itemResults ~= {} and isaacResults ~= {} then
            for key, value in pairs(isaacResults) do
                itemResults[key] = value
            end
            table.insert(itemTestQueue.Results, itemResults)
        end

        -- progress items
        local function IsValidCollectible(id)
            return Isaac.GetItemConfig():GetCollectible(id) ~= nil
        end
        local nextItem = itemTestQueue.NextItem + 1
        while not IsValidCollectible(nextItem) do
            if nextItem == CollectibleType.NUM_COLLECTIBLES then break end
            nextItem = nextItem + 1
        end
        if nextItem == CollectibleType.COLLECTIBLE_MAGIC_MUSHROOM then
            -- end sim
            reset_isaac()
            write_results(save_enums(), itemTestQueue.Results)

            itemTestQueue.State = SimulationState.Finished
            return
        end
        itemTestQueue.NextItem = nextItem

        itemTestQueue.State = SimulationState.ResetIsaac

        Isaac.ExecuteCommand("restart")
    end
end

mod:AddCallback(ModCallbacks.MC_POST_UPDATE, _on_update)