import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineOrder } from './medicine-order.entity';
import { MedicineOrderItem } from './medicine-order-item.entity';
import { Medicine } from '../medicines/medicine.entity';
import { MedicineOrdersService } from './medicine-orders.service';
import { MedicineOrdersController } from './medicine-orders.controller';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineOrder, MedicineOrderItem, Medicine]),
    DeliveryZonesModule,
    CouponsModule,
  ],
  controllers: [MedicineOrdersController],
  providers: [MedicineOrdersService],
  exports: [MedicineOrdersService],
})
export class MedicineOrdersModule {}