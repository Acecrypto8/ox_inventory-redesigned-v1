local function addDeferral(err)
    err = err:gsub("%^%d", "")

    AddEventHandler('playerConnecting', function(_, _, deferrals)
        deferrals.defer()
        deferrals.done(err)
    end)
end

-- Do not modify this file at all. This isn't a "config" file. You want to change
-- resource settings? Use convars like you were told in the documentation.
-- You did read the docs, right? Probably not, if you're here.
-- https://coxdocs.dev/ox_inventory#config

shared = {
    resource = GetCurrentResourceName(),
    framework = GetConvar('inventory:framework', 'esx'),
    playerslots = GetConvarInt('inventory:slots', 50),
    playerweight = GetConvarInt('inventory:weight', 30000),
    target = GetConvarInt('inventory:target', 0) == 1,
    police = json.decode(GetConvar('inventory:police', '["police", "sheriff"]')),
    networkdumpsters = GetConvarInt('inventory:networkdumpsters', 0) == 1
}

shared.dropslots = GetConvarInt('inventory:dropslots', shared.playerslots)
shared.dropweight = GetConvarInt('inventory:dropweight', shared.playerweight)

do
    if type(shared.police) == 'string' then
        shared.police = { shared.police }
    end

    local police = table.create(0, shared.police and #shared.police or 0)

    for i = 1, #shared.police do
        police[shared.police[i]] = 0
    end

    shared.police = police
end

if IsDuplicityVersion() then
    server = {
        bulkstashsave = GetConvarInt('inventory:bulkstashsave', 1) == 1,
        loglevel = GetConvarInt('inventory:loglevel', 1),
        randomprices = GetConvarInt('inventory:randomprices', 0) == 1,
        randomloot = GetConvarInt('inventory:randomloot', 1) == 1,
        evidencegrade = GetConvarInt('inventory:evidencegrade', 2),
        trimplate = GetConvarInt('inventory:trimplate', 1) == 1,
        vehicleloot = json.decode(GetConvar('inventory:vehicleloot', [[
			[
				["sprunk", 1, 1],
				["water", 1, 1],
				["garbage", 1, 2, 50],
				["panties", 1, 1, 5],
				["money", 1, 50],
				["money", 200, 400, 5],
				["bandage", 1, 1]
			]
		]])),
        dumpsterloot = json.decode(GetConvar('inventory:dumpsterloot', [[
			[
				["mustard", 1, 1],
				["garbage", 1, 3],
				["money", 1, 10],
				["burger", 1, 1]
			]
		]])),
    }

    local accounts = json.decode(GetConvar('inventory:accounts', '["money"]'))
    server.accounts = table.create(0, #accounts)

    for i = 1, #accounts do
        server.accounts[accounts[i]] = 0
    end
else
    PlayerData = {}
    client = {
        autoreload = GetConvarInt('inventory:autoreload', 0) == 1,
        screenblur = GetConvarInt('inventory:screenblur', 1) == 1,
        keys = json.decode(GetConvar('inventory:keys', '')) or { 'F2', 'K', 'TAB' },
        enablekeys = json.decode(GetConvar('inventory:enablekeys', '[249]')),
        aimedfiring = GetConvarInt('inventory:aimedfiring', 0) == 1,
        giveplayerlist = GetConvarInt('inventory:giveplayerlist', 0) == 1,
        weaponanims = GetConvarInt('inventory:weaponanims', 1) == 1,
        itemnotify = GetConvarInt('inventory:itemnotify', 1) == 1,
        weaponnotify = GetConvarInt('inventory:weaponnotify', 1) == 1,
        imagepath = GetConvar('inventory:imagepath', 'nui://ox_inventory/web/images'),
        dropprops = GetConvarInt('inventory:dropprops', 0) == 1,
        dropmodel = joaat(GetConvar('inventory:dropmodel', 'prop_med_bag_01b')),
        weaponmismatch = GetConvarInt('inventory:weaponmismatch', 1) == 1,
        ignoreweapons = json.decode(GetConvar('inventory:ignoreweapons', '[]')),
        suppresspickups = GetConvarInt('inventory:suppresspickups', 1) == 1,
        disableweapons = GetConvarInt('inventory:disableweapons', 0) == 1,
        disablesetupnotification = GetConvarInt('inventory:disablesetupnotification', 0) == 1,
        enablestealcommand = GetConvarInt('inventory:enablestealcommand', 1) == 1,
    }

    local ignoreweapons = table.create(0, (client.ignoreweapons and #client.ignoreweapons or 0) + 3)

    for i = 1, #client.ignoreweapons do
        local weapon = client.ignoreweapons[i]
        ignoreweapons[tonumber(weapon) or joaat(weapon)] = true
    end

    ignoreweapons[`WEAPON_UNARMED`] = true
    ignoreweapons[`WEAPON_HANDCUFFS`] = true
    ignoreweapons[`WEAPON_GARBAGEBAG`] = true
    ignoreweapons[`OBJECT`] = true
    ignoreweapons[`WEAPON_HOSE`] = true

    client.ignoreweapons = ignoreweapons

    local fallbackmarker = {
        type = 0,
        colour = {150, 150, 150},
        scale = {0.5, 0.5, 0.5}
    }

    client.shopmarker = json.decode(GetConvar('inventory:shopmarker', [[
        {
            "type": 29,
            "colour": [30, 150, 30],
            "scale": [0.5, 0.5, 0.5]
        }
    ]])) or fallbackmarker

    client.evidencemarker = json.decode(GetConvar('inventory:evidencemarker', [[
        {
            "type": 2,
            "colour": [30, 30, 150],
            "scale": [0.3, 0.2, 0.15]
        }
    ]])) or fallbackmarker

    client.craftingmarker = json.decode(GetConvar('inventory:craftingmarker', [[
        {
            "type": 2,
            "colour": [150, 150, 30],
            "scale": [0.3, 0.2, 0.15]
        }
    ]])) or fallbackmarker

    client.dropmarker = json.decode(GetConvar('inventory:dropmarker', [[
        {
            "type": 2,
            "colour": [150, 30, 30],
            "scale": [0.3, 0.2, 0.15]
        }
    ]])) or fallbackmarker
end

function shared.print(...) print(string.strjoin(' ', ...)) end

function shared.info(...) lib.print.info(string.strjoin(' ', ...)) end

---Throws a formatted type error.
---```lua
---error("expected %s to have type '%s' (received %s)")
---```
---@param variable string
---@param expected string
---@param received string
function TypeError(variable, expected, received)
    error(("expected %s to have type '%s' (received %s)"):format(variable, expected, received))
end

-- People like ignoring errors for some reason
local function spamError(err)
    shared.ready = false

    CreateThread(function()
        while true do
            Wait(10000)
            CreateThread(function()
                error(err, 0)
            end)
        end
    end)

    addDeferral(err)
    error(err, 0)
end

---@param name string
---@return table
---@deprecated
function data(name)
    if shared.server and shared.ready == nil then return {} end
    local file = ('data/%s.lua'):format(name)
    local datafile = LoadResourceFile(shared.resource, file)
    local path = ('@@%s/%s'):format(shared.resource, file)

    if not datafile then
        warn(('no datafile found at path %s'):format(path:gsub('@@', '')))
        return {}
    end

    local func, err = load(datafile, path)

    if not func or err then
        shared.ready = false
        ---@diagnostic disable-next-line: return-type-mismatch
        return spamError(err)
    end

    return func()
end

if not lib then
    return spamError('ox_inventory requires the ox_lib resource, refer to the documentation.')
end

local success, msg = lib.checkDependency('oxmysql', '2.7.3')

if success then
    success, msg = lib.checkDependency('ox_lib', '3.27.0')
end

if not success then
    return spamError(msg)
end

if not LoadResourceFile(shared.resource, 'web/build/index.html') then
    return spamError(
        'UI has not been built, refer to the documentation or download a release build.\n	^3https://coxdocs.dev/ox_inventory^0')
end

-- No we're not going to support qtarget any longer.
if shared.target and GetResourceState('ox_target') ~= 'started' then
    shared.target = false
    warn('ox_target is not loaded - it should start before ox_inventory')
end

if GetCurrentResourceName() ~= 'ox_inventory' then
    return spamError(string.format(
        'The resource should be named "ox_inventory", current name: %s',
        GetCurrentResourceName()
    ))
end

if lib.context == 'server' then
    shared.ready = false
    return require 'server'
end

require 'client'
