// ==================== Import Mongoose Types & Interfaces ====================
import { 
    CreateOptions,
    DeleteResult,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryFilter,
    QueryOptions, 
    Types, 
    UpdateQuery,
    RootFilterQuery,
} from "mongoose";


// ==================== Generic Database Repository Class ====================
// A reusable base repository class for common CRUD operations on any Mongoose model

export abstract class DatabaseRepository<TDocument> {

    constructor(protected readonly model: Model<TDocument>) {}


    // ==================== Create Operations ====================

    async create({
        data,
        options
    }: {
        data: Partial<TDocument>[],
        options?: CreateOptions;
    }): Promise<HydratedDocument<TDocument>[] | undefined> {
        return await this.model.create(data as any, options);
    }


    async insertMany({
        data,
    }: {
        data: Partial<TDocument>[],
    }): Promise<HydratedDocument<TDocument>[]> {
        return (await this.model.insertMany(data)) as HydratedDocument<TDocument>[];
    }


    // ==================== Read Operations (Find One & Find Many) ====================

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


    async find({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<lean<TDocument>[] | HydratedDocument<TDocument>[] | []> {
        const doc = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.limit) {
          doc.limit(options?.limit);
         }
         if (options?.skip) {
            doc.skip(options.skip);
         }
        return await doc.exec();
    }


    // ==================== Pagination Logic ====================

    async paginate({
        filter = {},
        select = {},
        options = {},
        page = 1,
        size = 5,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?:QueryOptions<TDocument> | undefined;
        page?:number ;
        size?:number ;
    }) {
        let docsCount: number | undefined = undefined;
        let pages:number | undefined = undefined;

        page = Math.floor(page < 1 ? 1 : page );
        options.limit = Math.floor(size < 1 || !size ? 5: size);
        options.skip = (page - 1) * options.limit ;
        docsCount = await this.model.countDocuments(filter);
        pages = Math.ceil(docsCount  / options.limit);
        const results = await this.find({filter , select , options }).limit();

        return {
            docsCount,
            pages,
            limit: options.limit,
            currentPage:page,
            results,
        };
    }


    // ==================== Update Operations ====================

    async findOneAndUpdate({
        filter,
        update,
        options,
    }: {
        filter?: QueryFilter<TDocument>;
        update?: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | null;
    }) {
        const doc = this.model.findOneAndUpdate(filter, update);
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
        id?: Types.ObjectId;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }) {
        const doc = this.model.findById(id).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        return await doc.exec();
    }


    // ==================== Specialized Update & Counters ====================

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


    // ==================== Delete Operations ====================

    async deleteOne({
        filter,
    }: {
        filter: QueryFilter<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }


    async deleteMany({
        filter,
    }: {
        filter: QueryFilter<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }


    async findOneAndDelete({
        filter,
    }: {
        filter: QueryFilter<TDocument>;
    }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndDelete(filter);
    }

}