const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const objectToFormData = (obj: Record<string, unknown>, form?: FormData, namespace?: string): FormData => {
    const fd = form ?? new FormData();

    for (const property in obj) {
        if (!Object.hasOwn(obj, property)) continue;

        const formKey = namespace ? `${namespace}[${property}]` : property;
        const value = obj[property];

        if (value instanceof Date) {
            if (isValidDate(value)) fd.append(formKey, value.toISOString());
        } else if (value instanceof Blob) {
            // Covers File too: FormData keeps a File's own name.
            fd.append(formKey, value);
        } else if (value !== null && typeof value === "object") {
            objectToFormData(value as Record<string, unknown>, fd, formKey);
        } else if (value || value === 0 || value === false) {
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
        const raw = obj[p];
        // A Date has no own keys, so it would otherwise recurse into nothing and vanish.
        const v = raw instanceof Date ? (isValidDate(raw) ? raw.toISOString() : "") : raw;
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
