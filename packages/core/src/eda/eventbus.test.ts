import { v4 } from "uuid"
import { DSEventMeta } from "./eventbus"

describe("Testing Eventbus", function () {
  describe("DSEventMeta", function () {
    it("should construct new meta", async function () {
      const res = DSEventMeta.create({
        callerId: v4(),
        originTransactionId: v4(),
        transactionId: v4(),
      })
      if (res.isError()) {
        throw new Error("can't create eventbus")
      }
      expect(res.value).toBeInstanceOf(DSEventMeta)
    })
    it("should fail with 'not uuid' error", async function () {
      const res = DSEventMeta.create({
        callerId: "something",
        originTransactionId: "something",
        transactionId: "something",
      })
      if (res.isOk()) {
        throw new Error("can't create eventbus")
      }
      expect(res.error).toBeTruthy()
    })
  })
})
