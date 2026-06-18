import { ImmunizationsService } from './immunizations.service';
import { CreateImmunizationDto } from './dto/create-immunization.dto';
export declare class ImmunizationsController {
    private readonly immunizationsService;
    constructor(immunizationsService: ImmunizationsService);
    create(user: any, dto: CreateImmunizationDto): Promise<{
        familyMember: {
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    }>;
    findAll(user: any, familyMemberId?: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    })[]>;
    due(user: any): Promise<({
        familyMember: {
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    })[]>;
    markGiven(user: any, id: string, body: {
        administeredDate?: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    }>;
    remove(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
