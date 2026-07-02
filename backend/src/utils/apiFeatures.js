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

                $text: {

                    $search: this.queryString.keyword

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

            "sort",

            "minPrice",

            "maxPrice",

            "minRating"

        ];

        removeFields.forEach(field =>

            delete queryObj[field]

        );

        if (

            this.queryString.minPrice ||

            this.queryString.maxPrice

        ) {

            queryObj.price = {};

            if (this.queryString.minPrice)

                queryObj.price.$gte =
                    Number(this.queryString.minPrice);

            if (this.queryString.maxPrice)

                queryObj.price.$lte =
                    Number(this.queryString.maxPrice);

        }

        if (this.queryString.minRating) {

            queryObj.averageRating = {

                $gte:
                    Number(this.queryString.minRating)

            };

        }

        this.query = this.query.find(queryObj);

        return this;

    }

    sort() {

        switch (this.queryString.sort) {

            case "price_asc":

                this.query = this.query.sort({

                    price: 1

                });

                break;

            case "price_desc":

                this.query = this.query.sort({

                    price: -1

                });

                break;

            case "rating":

                this.query = this.query.sort({

                    averageRating: -1

                });

                break;

            case "popular":

                this.query = this.query.sort({

                    numReviews: -1

                });

                break;

            default:

                this.query = this.query.sort({

                    createdAt: -1

                });

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