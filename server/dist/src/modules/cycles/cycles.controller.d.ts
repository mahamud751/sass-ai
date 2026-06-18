import { CyclesService } from './cycles.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
export declare class CyclesController {
    private readonly cyclesService;
    constructor(cyclesService: CyclesService);
    create(user: any, dto: CreateCycleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        familyMemberId: string | null;
        cycleLength: number | null;
        flow: string | null;
        symptoms: string[];
    }>;
    findAll(user: any, familyMemberId?: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        startDate: Date;
        endDate: Date | null;
        familyMemberId: string | null;
        cycleLength: number | null;
        flow: string | null;
        symptoms: string[];
    })[]>;
    predict(user: any, memberId: string): Promise<{
        message: string;
        lastPeriod?: undefined;
        predictedNext?: undefined;
        avgCycleLength?: undefined;
        basedOn?: undefined;
    } | {
        lastPeriod: Date;
        predictedNext: Date;
        avgCycleLength: number;
        basedOn: number;
        message?: undefined;
    }>;
    remove(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
