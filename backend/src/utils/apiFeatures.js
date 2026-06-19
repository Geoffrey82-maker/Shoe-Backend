class APIFeatures {
    constructor(
        query,
        queryString
    ) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        if (this.queryString.keyword) {
            this.query = this.query.find({
                name: {
                    $regex: this.queryString.keyword,
                    $options: "i"
                }
            });
        }
        return this;
    }

    filter() {
        const queryObj = {
            ...this.queryString
        };

        const removeFields = [
            "keyword",
            "page",
            "limit",
            "sort"
        ];

        removeFields.forEach(
            field => delete queryObj[field]
        );

        this.query = this.query.find(queryObj);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query = this.query.sort(this.queryString.sort);
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    }

    paginate(resultPage) {
        const currentPage = Number(
            this.queryString.page
        ) || 1;
        const skip = resultPage * (currentPage - 1);

        this.query = this.query.limit(resultPage).skip(skip);

        return this;
    }
}

export default APIFeatures;