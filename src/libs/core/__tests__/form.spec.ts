import { objectToFormData, objectToQueryString } from "../form";
import { describe, expect, test, it } from "vitest";

describe("objectToFormData", () => {
    test("returns a FormData instance", () => {
        const formData = objectToFormData({ firstName: "John", lastName: "Doe" });
        expect(formData).toBeInstanceOf(FormData);
        expect(formData.get("firstName")).toBe("John");
        expect(formData.get("lastName")).toBe("Doe");
    });

    test("appends into a provided FormData instance instead of creating a new one", () => {
        const existing = new FormData();
        existing.append("pre", "filled");

        const result = objectToFormData({ name: "John" }, existing);

        expect(result).toBe(existing);
        expect(result.get("pre")).toBe("filled");
        expect(result.get("name")).toBe("John");
    });

    test("flattens nested objects using bracket notation", () => {
        const data = {
            name: "John Doe",
            address: { street: "123 Main St", city: "Anytown", state: "CA" }
        };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("address[street]")).toBe("123 Main St");
        expect(formData.get("address[city]")).toBe("Anytown");
        expect(formData.get("address[state]")).toBe("CA");
    });

    test("flattens deeply nested objects (3 levels)", () => {
        const data = { a: { b: { c: "deep" } } };

        const formData = objectToFormData(data);

        expect(formData.get("a[b][c]")).toBe("deep");
    });

    test("treats arrays as objects keyed by index", () => {
        const data = { tags: ["x", "y", "z"] };

        const formData = objectToFormData(data);

        expect(formData.get("tags[0]")).toBe("x");
        expect(formData.get("tags[1]")).toBe("y");
        expect(formData.get("tags[2]")).toBe("z");
    });

    test("serializes Date values to ISO strings", () => {
        const data = { name: "John Doe", dob: new Date("1980-01-01") };

        const formData = objectToFormData(data);

        expect(formData.get("dob")).toBe("1980-01-01T00:00:00.000Z");
    });

    test("appends File values with their filename", () => {
        const file = new File(["hello"], "greeting.txt", { type: "text/plain" });
        const data = { document: file };

        const formData = objectToFormData(data);
        const stored = formData.get("document");

        expect(stored).toBeInstanceOf(File);
        expect((stored as File).name).toBe("greeting.txt");
    });

    test("appends Blob values (without a filename)", () => {
        const data = {
            name: "John Doe",
            avatar: new Blob(["avatar-data"], { type: "image/png" })
        };

        const formData = objectToFormData(data);
        const blob = formData.get("avatar");

        expect(blob).toBeInstanceOf(Blob);
        expect((blob as Blob).type).toBe("image/png");
    });

    test("ignores null and undefined values", () => {
        const data = { name: "John Doe", age: null, phone: undefined };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("age")).toBeNull();
        expect(formData.get("phone")).toBeNull();
    });

    test("coerces non-empty primitives to strings", () => {
        const data = { count: 5, active: true };

        const formData = objectToFormData(data);

        expect(formData.get("count")).toBe("5");
        expect(formData.get("active")).toBe("true");
    });

    // Documents a deliberate quirk: the final `else if (value)` branch is a
    // truthiness check, so falsy primitives (0, "", false) are dropped.
    test("drops falsy primitive values (0, empty string, false)", () => {
        const data = { zero: 0, empty: "", flag: false, kept: "yes" };

        const formData = objectToFormData(data);

        expect(formData.get("zero")).toBeNull();
        expect(formData.get("empty")).toBeNull();
        expect(formData.get("flag")).toBeNull();
        expect(formData.get("kept")).toBe("yes");
    });

    test("only copies own enumerable properties", () => {
        const proto = { inherited: "nope" };
        const data = Object.create(proto);
        data.own = "yes";

        const formData = objectToFormData(data);

        expect(formData.get("own")).toBe("yes");
        expect(formData.get("inherited")).toBeNull();
    });
});

describe("objectToQueryString", () => {
    it("returns an empty string for an empty object", () => {
        expect(objectToQueryString({})).toBe("");
    });

    it("converts a simple object to a query string", () => {
        const obj = { name: "John Doe", age: 30, active: true };
        expect(objectToQueryString(obj)).toBe("name=John%20Doe&age=30&active=true");
    });

    it("encodes nested objects with bracketed (and percent-encoded) keys", () => {
        const obj = {
            user: { name: "John Doe", age: 30, active: true },
            location: { city: "New York", state: "NY" }
        };

        expect(objectToQueryString(obj)).toBe(
            "user%5Bname%5D=John%20Doe&user%5Bage%5D=30&user%5Bactive%5D=true&location%5Bcity%5D=New%20York&location%5Bstate%5D=NY"
        );
    });

    it("encodes arrays by index", () => {
        expect(objectToQueryString({ ids: [1, 2] })).toBe("ids%5B0%5D=1&ids%5B1%5D=2");
    });

    it("keeps falsy scalars (0 and false) unlike objectToFormData", () => {
        expect(objectToQueryString({ a: 0, b: false })).toBe("a=0&b=false");
    });

    it("renders null and undefined as empty values", () => {
        expect(objectToQueryString({ a: null, b: undefined })).toBe("a=&b=");
    });

    it("percent-encodes reserved characters in keys and values", () => {
        expect(objectToQueryString({ q: "a&b c" })).toBe("q=a%26b%20c");
    });

    it("applies an explicit prefix to top-level keys", () => {
        expect(objectToQueryString({ x: 1 }, "p")).toBe("p%5Bx%5D=1");
    });

    it("omits nested empty objects (they produce no pairs)", () => {
        expect(objectToQueryString({ a: {}, b: 1 })).toBe("b=1");
    });
});
