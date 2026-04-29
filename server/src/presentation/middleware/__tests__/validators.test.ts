import * as fc from "fast-check";
import { Request, Response, NextFunction } from "express";
import { validatePlaceOrder, validateUpdateStatus } from "../validators";

const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

// Arbitraries
const nonEmptyString = fc.string({ minLength: 1 });
const emptyString = fc.constant("");
const validPhone = fc.stringMatching(PHONE_REGEX);
const invalidPhone = fc.string().filter((s) => !PHONE_REGEX.test(s));

function makeMockReq(body: any): Request {
  return { body } as Request;
}

function makeMockRes() {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockNext: NextFunction = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe("validatePlaceOrder middleware", () => {
  it("calls next() when body is valid", () => {
    const req = makeMockReq({
      items: [{ menuItemId: "item-1", quantity: 2 }],
      delivery: { name: "Jane", address: "123 St", phone: "+1234567890" },
    });
    const res = makeMockRes();

    validatePlaceOrder(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 when items array is empty", () => {
    const req = makeMockReq({
      items: [],
      delivery: { name: "Jane", address: "123 St", phone: "+1234567890" },
    });
    const res = makeMockRes();

    validatePlaceOrder(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 400 when delivery name is empty", () => {
    const req = makeMockReq({
      items: [{ menuItemId: "item-1", quantity: 1 }],
      delivery: { name: "", address: "123 St", phone: "+1234567890" },
    });
    const res = makeMockRes();

    validatePlaceOrder(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 400 when phone format is invalid", () => {
    const req = makeMockReq({
      items: [{ menuItemId: "item-1", quantity: 1 }],
      delivery: { name: "Jane", address: "123 St", phone: "not-a-phone" },
    });
    const res = makeMockRes();

    validatePlaceOrder(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 400 when quantity is zero", () => {
    const req = makeMockReq({
      items: [{ menuItemId: "item-1", quantity: 0 }],
      delivery: { name: "Jane", address: "123 St", phone: "+1234567890" },
    });
    const res = makeMockRes();

    validatePlaceOrder(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("Property: valid inputs always call next()", () => {
    fc.assert(
      fc.property(nonEmptyString, nonEmptyString, validPhone, fc.integer({ min: 1, max: 99 }), (name, address, phone, qty) => {
        const req = makeMockReq({
          items: [{ menuItemId: "item-1", quantity: qty }],
          delivery: { name, address, phone },
        });
        const res = makeMockRes();
        const next = jest.fn();

        validatePlaceOrder(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      }),
      { numRuns: 50 }
    );
  });
});

describe("validateUpdateStatus middleware", () => {
  it("calls next() when status is valid", () => {
    const req = makeMockReq({ status: "Preparing" });
    const res = makeMockRes();

    validateUpdateStatus(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 400 when status is invalid", () => {
    const req = makeMockReq({ status: "Flying" });
    const res = makeMockRes();

    validateUpdateStatus(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 400 when status is missing", () => {
    const req = makeMockReq({});
    const res = makeMockRes();

    validateUpdateStatus(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
