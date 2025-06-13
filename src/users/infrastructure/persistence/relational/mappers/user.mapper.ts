import { ServiceEntity } from 'src/services/infrastructure/persistence/relational/entities/service.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';
import { Service } from 'src/services/domain/service';

export class UserMapper {
    static toDomain(raw: UserEntity): User {
        
        const domainEntity = new User();
        console.log("returning raw", raw)
        domainEntity.id = raw.id;
        domainEntity.email = raw.email;
        domainEntity.verificationCode4 = raw.verificationCode4;
        domainEntity.stepCode = raw.stepCode;
        domainEntity.phone = raw.phone;
        domainEntity.password = raw.password;
        domainEntity.previousPassword = raw.previousPassword;
        domainEntity.provider = raw.provider;
        domainEntity.socialId = raw.socialId;
        domainEntity.firstName = raw.firstName;
        domainEntity.description = raw.description;
        domainEntity.lastName = raw.lastName;
        domainEntity.qualification = raw.qualification;
        domainEntity.experience = raw.experience;
        domainEntity.hourlyRate = raw.hourlyRate;
        domainEntity.availableDays = raw.availableDays;
        domainEntity.unavailableDates = raw.unavailableDates;
        domainEntity.tags = raw.tags;
        domainEntity.locationType = raw.locationType;
        domainEntity.photo = raw.photo;

        domainEntity.subjects = raw.subjects;
        domainEntity.gradeLevels = raw.gradeLevels;
        domainEntity.reviews_for_me = raw.reviews_for_me;
        domainEntity.university = raw.university;
        domainEntity.interests = raw.interests;
        domainEntity.goals = raw.goals;
        if (raw.photo) {
            domainEntity.photo = FileMapper.toDomain(raw.photo);
        }

        if(raw.services){
            domainEntity.services = raw.services
        }
        domainEntity.role = raw.role;
        domainEntity.status = raw.status;
        domainEntity.createdAt = raw.createdAt;
        domainEntity.updatedAt = raw.updatedAt;
        domainEntity.deletedAt = raw.deletedAt;
        return domainEntity;
    }

    static toPersistence(domainEntity: User): UserEntity {
        let role: RoleEntity | undefined = undefined;

        if (domainEntity.role) {
            role = new RoleEntity();
            role.id = Number(domainEntity.role.id);
        }

        

        let status: StatusEntity | undefined = undefined;

        if (domainEntity.status) {
            status = new StatusEntity();
            status.id = Number(domainEntity.status.id);
        }

        const persistenceEntity = new UserEntity();
        if (domainEntity.id && typeof domainEntity.id === 'number') {
            persistenceEntity.id = domainEntity.id;
        }
        persistenceEntity.email = domainEntity.email;
        if (domainEntity.phone)
            persistenceEntity.phone = domainEntity.phone

        if (domainEntity.stepCode)
            persistenceEntity.stepCode = domainEntity.stepCode;


        let photo: FileEntity | undefined | null = undefined;

        if (domainEntity.photo) {
            photo = new FileEntity();
            photo.id = domainEntity.photo.id;
            photo.path = domainEntity.photo.path;
            persistenceEntity.photo = photo;
        } else if (domainEntity.photo === null) {
            photo = null;
        }

        persistenceEntity.password = domainEntity.password;
        persistenceEntity.previousPassword = domainEntity.previousPassword;
        persistenceEntity.provider = domainEntity.provider;
        persistenceEntity.socialId = domainEntity.socialId;
        persistenceEntity.firstName = domainEntity.firstName;
        persistenceEntity.lastName = domainEntity.lastName;
        persistenceEntity.role = role;
        persistenceEntity.status = status;
        persistenceEntity.createdAt = domainEntity.createdAt;
        persistenceEntity.updatedAt = domainEntity.updatedAt;
        persistenceEntity.deletedAt = domainEntity.deletedAt;

        if(domainEntity.description){
            persistenceEntity.description = domainEntity.description;
        }

        persistenceEntity.locationType = domainEntity.locationType;

        if(domainEntity.subjects){
            persistenceEntity.subjects = domainEntity.subjects;
        }

        if(domainEntity.gradeLevels){
            persistenceEntity.gradeLevels = domainEntity.gradeLevels;
        }

        if(domainEntity.tags){
            persistenceEntity.tags = domainEntity.tags;
        }
        persistenceEntity.university = domainEntity.university;
        persistenceEntity.interests = domainEntity.interests;
        persistenceEntity.goals = domainEntity.goals;

        persistenceEntity.qualification = domainEntity.qualification;
        persistenceEntity.experience = domainEntity.experience;
        persistenceEntity.hourlyRate = domainEntity.hourlyRate;

        if(domainEntity.availableDays){
            persistenceEntity.availableDays = domainEntity.availableDays;
        }

        if(domainEntity.unavailableDates){
            persistenceEntity.unavailableDates = domainEntity.unavailableDates;
        }

        if(domainEntity.services){
            persistenceEntity.services = domainEntity.services.map((service) => {
                const serviceEntity = new ServiceEntity();
                serviceEntity.id = Number(service.id);
                return serviceEntity;
            });
        }

        if(domainEntity.verificationCode4){
            persistenceEntity.verificationCode4 = domainEntity.verificationCode4;
        }
        return persistenceEntity;
    }
}
