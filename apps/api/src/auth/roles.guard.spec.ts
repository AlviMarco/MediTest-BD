import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  function createGuard(requiredRoles?: number[]) {
    return new RolesGuard({
      get: jest.fn().mockReturnValue(requiredRoles),
    } as any);
  }

  function createContext(user?: { role_id: number }) {
    return {
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('allows requests without role metadata', () => {
    const guard = createGuard();
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows matching roles', () => {
    const guard = createGuard([1, 2]);
    expect(guard.canActivate(createContext({ role_id: 2 }))).toBe(true);
  });

  it('rejects requests without authenticated user', () => {
    const guard = createGuard([1]);
    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });

  it('rejects non-matching roles', () => {
    const guard = createGuard([1]);
    expect(() => guard.canActivate(createContext({ role_id: 4 }))).toThrow(
      ForbiddenException,
    );
  });
});
