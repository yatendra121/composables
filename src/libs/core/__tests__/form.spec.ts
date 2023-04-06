import { objectToFormData, objectToQueryString } from "../form";
import { describe, expect, test, it } from "vitest";

describe("objectToFormData", () => {
    test("should convert an object to a FormData instance", () => {
        const data = { firstName: "John", lastName: "Doe" };
        const formData = objectToFormData(data);

        expect(formData instanceof FormData).toBe(true);
    });

    test("should handle nested objects", () => {
        const data = {
            name: "John Doe",
            address: {
                street: "123 Main St",
                city: "Anytown",
                state: "CA"
            }
        };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("address[street]")).toBe("123 Main St");
        expect(formData.get("address[city]")).toBe("Anytown");
        expect(formData.get("address[state]")).toBe("CA");
    });

    test("should handle Date objects", () => {
        const data = {
            name: "John Doe",
            dob: new Date("1980-01-01")
        };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("dob")).toBe("1980-01-01T00:00:00.000Z");
    });

    test("should handle Blob objects", () => {
        const data = {
            name: "John Doe",
            avatar: new Blob(["avatar-data"], { type: "image/png" })
        };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("avatar")).toBeInstanceOf(Blob);
        expect(formData.get("avatar")?.type).toBe("image/png");
    });

    test("should ignore null and undefined values", () => {
        const data = {
            name: "John Doe",
            age: null,
            phone: undefined
        };

        const formData = objectToFormData(data);

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("age")).toBeNull();
        expect(formData.get("phone")).toBeNull();
    });
});

describe("objectToQueryString", () => {
    it("should return an empty string for an empty object", () => {
        expect(objectToQueryString({})).toEqual("");
    });

    it("should convert a simple object to a query string", () => {
        const obj = {
            name: "John Doe",
            age: 30,
            active: true
        };
        const expected = "name=John%20Doe&age=30&active=true";

        expect(objectToQueryString(obj)).toEqual(expected);
    });

    it("should handle nested objects correctly", () => {
        const obj = {
            user: {
                name: "John Doe",
                age: 30,
                active: true
            },
            location: {
                city: "New York",
                state: "NY"
            }
        };

        const expected =
            "user%5Bname%5D=John%20Doe&user%5Bage%5D=30&user%5Bactive%5D=true&location%5Bcity%5D=New%20York&location%5Bstate%5D=NY";

        expect(objectToQueryString(obj)).toEqual(expected);
    });
});
