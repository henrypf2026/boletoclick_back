import { ConflictException, Injectable } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(private readonly couponsRepository: CouponsRepository) {}

  async createCoupon(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const existingCoupon = await this.couponsRepository.getCouponByCode(
      createCouponDto.code,
    );

    if (existingCoupon) {
      throw new ConflictException(
        `Ya existe un cupón registrado con el código '${createCouponDto.code}'.`,
      );
    }

    return await this.couponsRepository.createCoupon(createCouponDto);
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await this.couponsRepository.getAllCoupons();
  }

  async getCouponById(id: string): Promise<Coupon> {
    return await this.couponsRepository.getCouponById(id);
  }

  async getValidCouponByCode(code: string): Promise<Coupon> {
    return await this.couponsRepository.getValidCouponByCode(code);
  }

  async updateCoupon(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    if (updateCouponDto.code) {
      const existingCoupon = await this.couponsRepository.getCouponByCode(
        updateCouponDto.code,
      );

      if (existingCoupon && existingCoupon.id !== id) {
        throw new ConflictException(
          `No se puede actualizar; el código '${updateCouponDto.code}' ya está en uso por otro cupón.`,
        );
      }
    }

    return await this.couponsRepository.updateCoupon(id, updateCouponDto);
  }

  async deactivateCoupon(id: string): Promise<{ message: string }> {
    const coupon = await this.couponsRepository.getCouponById(id);

    await this.couponsRepository.deactivateCoupon(id);

    return {
      message: `El cupón '${coupon.code}' ha sido desactivado exitosamente.`,
    };
  }
}
