export const objectToFormData = (obj: Record<string, unknown>, form?: FormData, namespace?: string): FormData => {
    const fd = form ?? new FormData();

    for (const property in obj) {
        if (!Object.hasOwn(obj, property)) continue;

        const formKey = namespace ? `${namespace}[${property}]` : property;
        const value = obj[property];

        if (value instanceof Date) {
            fd.append(formKey, value.toISOString());
        } else if (
            value !== null &&
            typeof value === "object" &&
            !(value instanceof File) &&
            !(value instanceof Blob)
        ) {
            objectToFormData(value as Record<string, unknown>, fd, formKey);
        } else if (value instanceof File) {
            fd.append(formKey, value, value.name);
        } else if (value instanceof Blob) {
            fd.append(formKey, value);
        } else if (value) {
            fd.append(formKey, String(value));
        }
    }

    return fd;
};

export const objectToQueryString = (obj: Record<string, unknown>, prefix?: string): string => {
    const str: string[] = [];

    for (const p in obj) {
        if (!Object.hasOwn(obj, p)) continue;

        const k = prefix ? `${prefix}[${p}]` : p;
        const v = obj[p];
        const value =
            v !== null && typeof v === "object"
                ? objectToQueryString(v as Record<string, unknown>, k)
                : `${encodeURIComponent(k)}=${encodeURIComponent(String(v ?? ""))}`;
        if (value) {
            str.push(value);
        }
    }

    return str.join("&");
};
