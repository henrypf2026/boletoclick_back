import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsRepository {
  constructor(
    @InjectRepository(Coupon)
    private readonly ormCouponsRepository: Repository<Coupon>,
  ) {}

  async createCoupon(couponData: CreateCouponDto): Promise<Coupon> {
    const newCoupon = this.ormCouponsRepository.create(couponData);
    return await this.ormCouponsRepository.save(newCoupon);
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await this.ormCouponsRepository.find({
      relations: { event: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getCouponById(id: string): Promise<Coupon> {
    const foundCoupon = await this.ormCouponsRepository.findOne({
      where: { id },
      relations: { event: true },
    });

    if (!foundCoupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }

    return foundCoupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const cleanedCode = code.trim().toUpperCase();
    return await this.ormCouponsRepository.findOne({
      where: { code: cleanedCode },
    });
  }

  async getValidCouponByCode(code: string): Promise<Coupon> {
    const cleanedCode = code.trim().toUpperCase();

    const foundCoupon = await this.ormCouponsRepository
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.event', 'event')
      .where('coupon.code = :code', { code: cleanedCode })
      .andWhere('coupon.isActive = true')
      .andWhere('coupon.expiresAt > :now', { now: new Date() })
      .getOne();

    if (!foundCoupon) {
      throw new NotFoundException(
        `El cupón '${cleanedCode}' no existe, está inactivo o ya expiró.`,
      );
    }

    return foundCoupon;
  }

  async updateCoupon(id: string, updateData: UpdateCouponDto): Promise<Coupon> {
    const existingCoupon = await this.getCouponById(id);

    const updatedCoupon = this.ormCouponsRepository.merge(
      existingCoupon,
      updateData,
    );
    return await this.ormCouponsRepository.save(updatedCoupon);
  }

  async deactivateCoupon(id: string): Promise<void> {
    const result = await this.ormCouponsRepository.update(id, {
      isActive: false,
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
  }
}
