/**
 * To Convert the Object into formData.
 * @param {Object} obj
 * @param {FormData} form
 * @param {String} namespace
 */
export const objectToFormData = (obj: any, form?: FormData, namespace?: string) => {
    const fd = form || new FormData();
    let formKey;

    for (const property in obj) {
        if (Object.hasOwn(obj, property)) {
            if (namespace) {
                formKey = namespace + "[" + property + "]";
            } else {
                formKey = property;
            }

            // if the property is an object, but not a File, use recursivity.
            if (obj[property] instanceof Date) {
                fd.append(formKey, obj[property].toISOString());
            } else if (
                typeof obj[property] === "object" &&
                !(obj[property] instanceof File) &&
                !(obj[property] instanceof Blob)
            ) {
                objectToFormData(obj[property], fd, formKey);
            } else {
                if (obj[property] instanceof File) {
                    fd.append(formKey, obj[property], obj[property].name);
                } else if (obj[property]) {
                    fd.append(formKey, obj[property]);
                }
            }
        }
    }

    return fd;
};

/**
 * Convert Query Object to Query String
 * @param obj
 * @param prefix
 */
export const objectToQueryString = (obj: any, prefix?: string): string => {
    const str: string[] = [];

    for (const p in obj) {
        if (Object.hasOwn(obj, p)) {
            const k = prefix ? prefix + "[" + p + "]" : p;
            const v = obj[p];
            const value =
                v !== null && typeof v === "object"
                    ? objectToQueryString(v, k)
                    : encodeURIComponent(k) + "=" + encodeURIComponent(v || "");
            if (value) {
                str.push(value);
            }
        }
    }
    return str.join("&");
};
