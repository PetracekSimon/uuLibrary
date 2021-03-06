"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/request-error.js");

const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`
  }
};
const STATES = {
  available: "available",
  borrowed: "borrowed",
  active: "active"
};

class RequestAbl {
  constructor() {
    this.validator = new Validator(Path.join(__dirname, "..", "api", "validation_types", "request-types.js"));
    this.dao = DaoFactory.getDao("request");
    this.dao.createSchema();
    this.locationDao = DaoFactory.getDao("location");
    this.bookDao = DaoFactory.getDao("book");
  }

  async requestList(awid, dtoIn) {
    // HDS 1.2, 1.3, A1, A2
    let validationResult = this.validator.validate("requestListDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );
    // HDS 2
    if (!dtoIn.pageInfo) dtoIn.pageInfo = {};
    let dtoOut = await this.dao.listByCriteria(awid, dtoIn, dtoIn.pageInfo);

    // HDS 3
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }

  async requestCreate(awid, dtoIn, session) {
    // HDS 1.2, 1.3, A1, A2
    let validationResult = this.validator.validate("requestCreateDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );
    // HDS 2
    let book = await this.bookDao.getByCode(awid, dtoIn.bookCode);
    // HDS 2.1
    if (!book) {
      // A3
      throw new Errors.Create.BookDoesNotExist({ uuAppErrorMap }, { code: dtoIn.bookCode });
    }
    // HDS 2.2
    if (dtoIn.type === "borrow" && book.state === STATES.borrowed) {
      // A4
      throw new Errors.Create.BookIsNotInProperState(
        { uuAppErrorMap },
        { state: book.state, expectedState: STATES.available }
      );
    }
    // HDS 2.3
    else if (dtoIn.type === "return" && book.state === STATES.available) {
      // A5
      throw new Errors.Create.BookIsNotInProperState(
        { uuAppErrorMap },
        { state: book.state, expectedState: STATES.borrowed }
      );
    }
    // HDS 3
    // HDS 3.1
    let location = await this.locationDao.getByCode(awid, book.locationCode);
    if (location.state !== STATES.active) {
      // A6
      throw new Errors.Create.LocationIsNotInProperState(
        { uuAppErrorMap },
        { state: location.state, expectedState: STATES.active }
      );
    }

    // HDS 4
    let requestDtoIn = {
      awid: awid,
      code: `${dtoIn.type.toUpperCase()}-${dtoIn.bookCode}`,
      bookCode: dtoIn.bookCode,
      type: dtoIn.type,
      from: this.formatDate(dtoIn.from),
      customer: {
        uuIdentity: session._identity._uuIdentity,
        name: session._identity._name,
        email: session._attributes.email
      }
    };
    // HDS 4.1
    let request;
    try {
      request = await this.dao.create(requestDtoIn);
    } catch (error) {
      // A7
      throw new Errors.Create.CreateByDaoFailed({ uuAppErrorMap }, { cause: error });
    }

    // HDS 5
    let dtoOut = { ...request };
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("-");
  }
}

module.exports = new RequestAbl();
