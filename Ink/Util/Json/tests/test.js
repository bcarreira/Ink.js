/*globals equal,test,deepEqual,hugeObject,ok*/
Ink.requireModules(['Ink.Util.Json'], function (Json) {
    'use strict';

    // We already know that the browser has a decent implementation of JSON.
    Json._nativeJSON = null;
    var nativeJSON = window.nativeJSON;
    var crockfordJSON = window.JSON;
    
    // shortcut for Json.stringify
    var s = function (input) {return Json.stringify(input, false);};

    function JSONEqual(a, b, msg) {
        if (typeof b === 'undefined') {
            b = a;
            a = s(a);
        }
        if (typeof msg === 'undefined') {
            msg = a;
        }
        try {
            deepEqual(eval('(' + a + ')'), b, msg);
        } catch(e) {
            ok(false, 'SyntaxError: \'(' + a + ')\' caused: ' + e + '.');
        }
    }

    test('Stringify primitive values', function () {
        equal(s(''), '""');
        equal(s('a'), '"a"');
        equal(s('á'), '"á"');
        deepEqual(s(1), '1');
        equal(s(true), 'true');
        equal(s(false), 'false');
        equal(s(null), 'null');
        equal(s(NaN), 'null');
        equal(s(Infinity), 'null');
        equal(s(-Infinity), 'null');
    });

    test('Escaping', function () {
        equal(s('"'), '"\\""');
        equal(s('""'), '"\\"\\""');

        equal(s('\\'), '"\\\\"');
        equal(s('\\\\'), '"\\\\\\\\"');
    });

    test('Serialize objects', function () {
        JSONEqual(s({a: 'c'}), {"a": "c"});
        JSONEqual(s({a: 'a'}), {"a": "a"});
        JSONEqual(s({d: 123, e: false, f: null, g: []}),
            {"d": 123,"e": false,"f": null,"g": []});
        JSONEqual(s({1: 2}), {1: 2});
    });

    test('Serialize arrays', function () {
        JSONEqual(s([1, false, 1, 'CTHULHU']),
            [1,false,1,"CTHULHU"]);
        JSONEqual(s([undefined, 1, {}]),
            [null, 1, {}]);
    });

    test('dates', function () {
        var aDate = new Date();
        deepEqual(s(aDate), '"' + aDate.toISOString() + '"');
        deepEqual(eval(s([aDate])), [aDate.toISOString()]);
        JSONEqual(s([aDate]), [aDate.toISOString()]);
    });

    test('Nesting!', function () {
        var nested = [
            {
                cthulhu: ['fthagn']
            },
            "r'lyeh",
            123
        ];
        JSONEqual(s(nested), nested);
    });

    test('Stringify large objects', function () {
        // hugeObject.js
        serialize(s, hugeObject, 'our JSON stuffs');
        serialize(nativeJSON.stringify, hugeObject, 'native JSON stuffs');
        serialize(crockfordJSON.stringify, hugeObject, 'crockford\'s JSON stuffs');
    });

    function serialize(func, obj, name) {
        var start = new Date();
        var serialized = func(obj);
        ok(true, (new Date() - start) + 'ms with ' + name);
        
        var chk = eval('('+serialized+')');
        equal(nativeJSON.stringify(chk), nativeJSON.stringify(obj), name);
    }

    test('Functions can\'t be stringified, to match the native JSON API', function () {
        deepEqual(s(function () {}), "null");
    });
});
