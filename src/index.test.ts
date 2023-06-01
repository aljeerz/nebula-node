import { describe, it, expect } from "vitest";
import { NebulaGraphTransformsHelper } from "./helper";
import { NebulaGeneratorFunction } from "./types";

describe('NebulaGraph Transforms Helper',() => {
    it('Should transform query $params according to params object', () => {
        const tr = NebulaGraphTransformsHelper.replaceParamsIntoQuery('MATCH (v:tagName) WHERE id(v) == $id RETURN id(v) as id, "$myStr" as str',{
            id: 123456789,
            myStr : "ItWorks!"
        })
        expect(tr).toBe('MATCH (v:tagName) WHERE id(v) == 123456789 RETURN id(v) as id, "ItWorks!" as str')
    })

    it('Should escape quotes and backslashes',() => {
        const sanitised = {
            p1:NebulaGraphTransformsHelper.sanitiseParamString(`"InjectedDoubleQuotes"`) ,
            p2:NebulaGraphTransformsHelper.sanitiseParamString(`'InjectedSingleQuotes'`) ,
            p3:NebulaGraphTransformsHelper.sanitiseParamString(`\\InjectBackSlash\\`) ,
        }

        expect(sanitised).toStrictEqual({
            p1:`\\"InjectedDoubleQuotes\\"` ,
            p2:`\\'InjectedSingleQuotes\\'` ,
            p3:`\\\\InjectBackSlash\\\\` ,
        })
    })

    it('Should execute generator function and replace it in the query',() => {
        const gen : NebulaGeneratorFunction = {
            namespace: "test",
            name: "getmeid",
            execute: () => {
                return 59885
            }
        }

        const generated = NebulaGraphTransformsHelper.execGeneratorFunction(`INSERT VERTEX tagname(mynumber) VALUES 1:("test::getmeid()")`,gen)
        expect(generated.generated).toStrictEqual([59885])
        expect(generated.query).toBe(`INSERT VERTEX tagname(mynumber) VALUES 1:("59885")`)
    })
})