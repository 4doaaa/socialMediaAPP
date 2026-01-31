import { CreateOptions,
     HydratedDocument,
      Model,
      MongooseUpdateQueryOptions,
       PopulateOptions,
        ProjectionType,
         QueryFilter,
         QueryOptions, 
         UpdateQuery,
         } from "mongoose";

// ==================== Generic Database Repository Class ====================
// A reusable base repository class for common CRUD operations on any Mongoose model

export abstract class DatabaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) {}

    // ==================== Create Multiple Documents ====================

    async create({
        data,
        options
    }: {
        data: Partial<TDocument>[],
        options?: CreateOptions;
    }): Promise<HydratedDocument<TDocument>[] | undefined> {
        return await this.model.create(data as any, options);
    }

    // ==================== Find One Document ====================

    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: QueryFilter<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }) {
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        return await doc.exec();
    }

    // ==================== Find Document By ID ====================

    async findById({
        id,
        select,
        options,
    }: {
        id?: any;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }) {
        const doc = this.model.findById(id).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        return await doc.exec();
    }

    // ==================== Update One Document ====================

    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: QueryFilter<TDocument>;
        update: UpdateQuery<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
}