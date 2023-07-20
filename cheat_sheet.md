
store: id key value ttl updated last_active active

exists
SELECT keys FROM store WHERE key IN (keys) AND active=1 AND t<last_active+ttl

ping (keys)
t = NOW()
UPDATE store SET last_active=t WHERE key IN (keys) AND active=1 AND t<last_active+ttl

read (keys)
t=NOW()
SELECT id, key, q FROM store WHERE key IN (keys) AND active=1 AND t<last_active+ttl
UPDATE store SET last_active=t WHERE id IN (ids)
return [key, q]

inactivate(keys)


clean_ip



# CHEAT SHEET FOR 3KV

This key-value store is named 3KV because it has 3 ways how keys can be provided. In the HTTP body, in the path or in the url query.

Notice that keys containing forward slashes cannot be given in the path.

Notice that keys and values containing comas cannot be given in the HTTP query.

## Read Selectors

When you read data, you select fields with the URL query named selectors.

Asterix is the wildcard selector, choosing all available selectors.

    * = [key, value, created, updated, last_active, ttl, expiry]

Selectors can only be chosen in the HTTP query and nowhere else.

    ?selectors=s1,...,sn,*

Selectors are only used when you read data with the GET verb. If you create or update data with the GET verb then you must use the ttls or values querries.

## Sending Requests with a Web Browser

The command, cmd can be provided in the URL query with any GET verb.

    GET     ?cmd=create&repalce=false&format=html
    GET     ?cmd=create&repalce=true&format=html
    GET     ?cmd=read&format=html
    GET     ?cmd=update&format=html
    GET     ?cmd=delete&format=html
    GET     ?cmd=exists&format=html
    GET     ?cmd=ping&format=html
    GET     ?cmd=inactivate&format=html
    
If cmd is left out, then cmd defaults to ?cmd=read&format=json

Multiple queries are separated with the & symbol. Such as ?cmd=create&repalce=true

## Keys

Keys can be given after the root /store/ of the HTTP path

    /store/key1/.../keyN

or then they can be given in the URL query, like this

    ?keys=key1,...,keyN

or then they can be given in the HTTP body as a list, like this

    [key1, ..., keyN]

or then they can be given as the keys in a JSON body.

## TTL and Values

You can provide values with the keys in the HTTP body like this

    {
        "key1": { "ttl": "1", "value": "value1" },
        ...
        "keyN": { "ttl": "N", "value": "valueN" }
    }

You can also provide values in the HTTP query, like this

    /store?keys=key1,...,keyN&ttl=1,...,N&values=value1,...,valueN
    /store/key1/.../keyN?ttl=1,...,N&values=value1,...,valueN

The ttl is given in full seconds. The default value for ttl is <span style="color:green">"0"</span>, meaning infinity.

The default value for value is the empty string <span style="color:green">""</span>.

If only 1 ttl is given, then it becomes the default ttl or if only 1 value is given then it becomes the default value.

## Format in the HTML Query

<span style="color:green">?format=html</span> returns the response in HTML format.

<span style="color:green">?format=json</span> returns the response in JSON format.

Missing or mispelled format becomes JSON.

## Allowed characters

Keys and values have a limited number of allowed characters.

All <span style="color:green">English alphanumeric characters</span> are allowed and then the special characters <span style="color:green">/ . , @ ~ ( ) _ \ - : ; *</span> are also allowed

Following character in the URL path cannot be used for naming keys or values: <span style="color:pink">/</span> 

Following character in the HTTP query cannot be used for naming keys or values: <span style="color:pink">,</span> 

Prefer using a HTTP body whenever needed.

## VERBS

All commands can use GET for web browser compatibility, but there are other prefered ways.

The preferred ways:

| CMD \ VERB| GET | POST | PUT | PATCH | DELETE | query | HTTP body |
|---|---|---|---|---|---|---|---|
|create w/o replace| ?cmd=create | YES ||||| YES
|create w/ replace| ?cmd=create | YES ||||?replace=true| YES
|read| YES ||||| ?selectors=...
|update| ?cmd=update | | YES |||| YES
|delete| ?cmd=delete | | | | YES
|exists| YES ||||| ?cmd=exists
|ping| ?cmd=ping | | | YES
|inactivate|| | | YES | | ?cmd=inactivate
|

## CREATE

Default value for ttl is "0". If a single ttl value is given, then it becomes the new default.

Default value for value is the empty string "". If a single value for value is given then it beccomes the default.

Default value for replace is true.

    HTTP body:  { "key1": { "ttl": "1", "value": "val1" },
                  ...,
                  "keyN": { "ttl": "N", "value": "valN"}}
    
    # Request methods
    POST
    GET ?cmd=create

    # Pseudo code
    function CREATE(keys, values, ttls, replace=false):
        default_value = values.length == 1 ? values[0] : ""
        default_ttl = ttls.length == 1 ? ttls[0] : 0
        now = date.now
        if replace:
            INSERT OR REPLACE INTO TABLE (key=keys, value=values, ttl=ttls, created=now, updated=now, last_accessed=now, ttl=ttls, active=true)
        else:
            INSERT INTO TABLE (key=keys, value=values, ttl=ttl, created=now, updated=now, last_accessed=now, ttl=ttls, active=true)

## READ

If selectors are missing then the selectors default to <span style="color:green">?selectors=key,value</span>.

If keys are missing then the keys defaults to all keys.

Keys and their values are always returned, if that is not what you look for, then try EXISTS OR PING.

    HTTP body: [key1,...,keyN]

    # Request methods
    GET 
    GET ?cmd=read

    # Pseudo code
    function READ(keys, s1, ..., sn):
        union = * UNION (key, value, s1, ..., sn)
        keys' = PING(keys)
        if keys' == []:
            return {}
        else:
            return JSON(SELECT union FROM TABLES WHERE key IN (keys'))

## UPDATE

<span style="color:pink">REMARK: If the key is missing, then it is not inserted.</span>

Default value for ttl is "0". If a single ttl value is given, then it becomes the new default.

Default value for value is the empty string "". If a single value for value is given then it beccomes the default.

    HTTP body:  { "key1": { "ttl": "1", "value": "val1" },
                  ...,
                  "key1": { "ttl": "N", "value": "valN"}}

    # Request methods
    PUT
    GET ?cmd=update

    # Pseudo code
    function UPDATE(keys, values, ttls):
        default_value = values.length == 1 ? values[0] : ""
        default_ttl = ttls.length == 1 ? ttls[0] : 0
        now = date.now
        UPDATE TABLE SET (value=values, ttl=ttl, created=now, updated=now, last_accessed=now, ttl=ttls, active=true) WHERE key IN (keys)

## DELETE

    HTTP body: [key1,...,keyN]

    # Request methods
    DELETE 
    GET ?cmd=delete

    # Pseudo code
    function DELETE(keys):
        DELETE FROM TABLE WHERE key=(keys)


## EXISTS

    HTTP body: [key1,...,keyN]

    # Preferred ways, works with browser
    GET ?cmd=exists

    # Pseudo code
    function EXISTS(keys):
        return JSON(SELECT key FROM TABLES WHERE key IN (keys))


## PING

    HTTP body: [key1,...,keyN]

    # Request methods
    PATCH ?cmd=ping
    GET ?cmd=ping


    # Pseudo code
    function EXISTS(keys):
        now = date.now
        ttls = READ(keys, ttl)
        UPDATE TABLE SET last_accessed=now WHERE key IN (keys)
        return JSON(SELECT key FROM TABLES WHERE key IN (keys))

## INACTIVATE

    HTTP body: [key1,...,keyN]

    # Request methods
    PATCH ?cmd=inactivate
    GET ?cmd=inactivate

    function INACTIVATE(keys) - PATCH
        UPDATE active=0 WHERE key IN (keys)

