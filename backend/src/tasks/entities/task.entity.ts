import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Observation } from '../../observations/entities/observation.entity';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ type: 'date', nullable: true })
  date: Date | null;

  @Column({ default: false })
  completed: boolean;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, (company) => company.tasks)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => Observation, (observation) => observation.task)
  observations: Observation[];

  @CreateDateColumn()
  createdAt: Date;
}

