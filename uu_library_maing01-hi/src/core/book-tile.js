//@@viewOn:imports
import * as UU5 from "uu5g04";
import "uu5g04-bricks";
import "uu5tilesg01";
import "uu_plus4u5g01-bricks";
import "uu_plus4u5g01-console";
import UuP from "uu_pg01";
import "uu_pg01-bricks";
import "uu_pg01-tiles";

import Config from "./config/config.js";
import Calls from "../calls";
import ModalHelper from "../helpers/modal-helper.js";

import Form from "./create-book-modal";

import Lsi from "./book-list-lsi.js";
//@@viewOff:imports

export const BookTile = UU5.Common.VisualComponent.create({
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: Config.TAG + "BookTile",
    classNames: {
      main: () => Config.Css.css``,
      boldText: () => Config.Css.css`
        font-weight: bold;
      `,
      confirmDeleteModal: () => Config.Css.css`
        .uu5-bricks-modal-footer{
          display: flex;
          flex-direction: row-reverse;
        }
      `,
      cancelButton: () => Config.Css.css`
        margin-right: 4px;
    `,
      getBackDiv: () => Config.Css.css`
        color: #bdbdbd;
        font-size: 16px;
        display: flex;
        cursor: pointer;
        &:hover{
          text-decoration: underline;
        }
      `,
      getBackIcon: () => Config.Css.css`
        color: #757575;
        transform: rotate(90deg);
        font-size: 20px !important;
        `,
      link: () => Config.Css.css`
        cursor: pointer;
        text-decoration: underline !important;
        color: #1976D2 !important;
        `,
      genreBadge: () => Config.Css.css`
        margin-right: 5px;
        margin-bottom: 5px;
      `
    }
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    this._listDataManager = UU5.Common.Reference.create();
    this._createModal = UU5.Common.Reference.create();
    this._updateModal = UU5.Common.Reference.create();
    this._deleteModal = UU5.Common.Reference.create();

    return {};
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _handleBorrowBook(book) {
    let date = new Date();
    let data = {
      bookCode: book.code,
      type: "borrow",
      from: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`
    };
    let classNames = this.getClassName();
    return new Promise((done, fail) =>
      Calls.requestCreate({
        data,
        done: data => {
          done(data);
          this._listDataManager.current.load();
          UU5.Environment.getPage()
            .getAlertBus()
            .setAlert({
              colorSchema: "success",
              closeTimer: 7000,
              content: (
                <UU5.Bricks.Span>
                  <UU5.Bricks.Lsi lsi={Lsi.successBorrowPrefix} />
                  &nbsp;
                  <UU5.Bricks.Link href="http://www.unicorn.com/" className={classNames.link()} target="_blank">
                    <UU5.Bricks.Lsi lsi={Lsi.book} />
                  </UU5.Bricks.Link>
                  &nbsp;
                  <UU5.Bricks.Lsi lsi={Lsi.successBorrowSuffix} />
                </UU5.Bricks.Span>
              )
            });
        },
        fail
      })
    );
  },
  _handleDelete(code) {
    return new Promise((resolve, reject) => {
      Calls.bookDelete({
        data: { code },
        done: dtoOut => {
          ModalHelper.close();
          resolve(dtoOut);
          this._listDataManager.current.load();
        },
        fail: failDtoOut => {
          UU5.Environment.getPage()
            .getAlertBus()
            .setAlert({ colorSchema: "danger", content: failDtoOut.message });
          ModalHelper.close();
          reject(failDtoOut);
        }
      });
    });
  },
  _handleUpdate(data) {
    return new Promise((resolve, reject) => {
      Calls.bookUpdate({
        data,
        done: dtoOut => {
          ModalHelper.close();
          resolve(dtoOut);
          this._listDataManager.current.load();
        },
        fail: failDtoOut => {
          UU5.Environment.getPage()
            .getAlertBus()
            .setAlert({ colorSchema: "danger", content: failDtoOut.message });
          ModalHelper.close();
          reject(failDtoOut);
        }
      });
    });
  },

  _getTileActionList(tileData) {
    let actions = [];
    let permissions = JSON.parse(localStorage.getItem("permission"));
    if (
      permissions.includes["Administrators"] ||
      permissions.includes("Managers") ||
      permissions.includes("Librarirans")
    ) {
      actions = [
        {
          content: <UU5.Bricks.Lsi lsi={Lsi.updateButton} />,
          onClick: () => {
            this._openUpdateModal(tileData);
          },
          bgStyle: "filled",
          priority: 0
        },
        {
          content: <UU5.Bricks.Lsi lsi={Lsi.deleteButton} />,
          onClick: () => {
            this._openDeleteConfirmModal(tileData);
          },
          bgStyle: "filled",
          priority: 0
        }
      ];
      if (tileData.state === "available") {
        actions.push({
          content: <UU5.Bricks.Lsi lsi={Lsi.borrowButton} />,
          onClick: () => this._handleBorrowBook(tileData),
          bgStyle: "filled",
          colorSchema: "success",
          priority: 1
        });
      }
      return actions;
    } else if (permissions.includes("Customers")) {
      if (tileData.state === "available") {
        return [
          {
            content: <UU5.Bricks.Lsi lsi={Lsi.borrowButton} />,
            onClick: () => this._handleBorrowBook(tileData),
            bgStyle: "filled",
            colorSchema: "success",
            priority: 1
          }
        ];
      } else {
        return [];
      }
    } else {
      return [];
    }
  },

  _openDeleteConfirmModal(data) {
    let classNames = this.getClassName();
    let modal = UU5.Environment.getPage().getModal();
    modal.open({
      header: <UU5.Bricks.Lsi lsi={Lsi.deleteBook} />,
      content: <UU5.Bricks.Lsi lsi={Lsi.areYouSureToDelete} />,
      footer: (
        <UU5.Bricks.Div>
          <UU5.Bricks.Button
            content={<UU5.Bricks.Lsi lsi={Lsi.cancel} />}
            className={classNames.cancelButton()}
            onClick={() => modal.close()}
          />
          <UU5.Bricks.Button
            colorSchema="red"
            content={<UU5.Bricks.Lsi lsi={Lsi.deleteButton} />}
            onClick={() => this._listDataManager.current.delete(data.code)}
          />
        </UU5.Bricks.Div>
      ),
      className: classNames.confirmDeleteModal()
    });
  },
  _openUpdateModal(data) {
    ModalHelper.open(
      <UU5.Bricks.Lsi lsi={Lsi.createFeeConfiguration} />,
      <Form
        handleOnSave={this._listDataManager.current.update}
        data={data}
        update={true}
        id={UU5.Common.Tools.generateUUID(6)}
      />
    );
  },
  _getBookInfoLine(name, value) {
    let classNames = this.getClassName();
    return (
      <UU5.Bricks.Div key={UU5.Common.Tools.generateUUID(4)}>
        <UU5.Bricks.Lsi lsi={Lsi[name]} className={classNames.boldText()} />
        :&nbsp;&nbsp;
        <UU5.Bricks.Span content={value} />
      </UU5.Bricks.Div>
    );
  },
  _getGenre(genreCodes = []) {
    let classNames = this.getClassName();
    let library = JSON.parse(localStorage.getItem("library"));
    let libraryGenresCodes = {};
    library.genres.forEach(genre => {
      libraryGenresCodes[genre.code] = genre.name;
    });
    let result = [];
    genreCodes.forEach(genre => {
      result.push(
        <UU5.Bricks.Label
          className={classNames.genreBadge()}
          colorSchema={library.colorSchema}
          content={<UU5.Bricks.Lsi lsi={libraryGenresCodes[genre]} />}
        />
      );
    });

    return this._getBookInfoLine("genre", result);
  },
  _getCondition(code) {
    let libraryString = localStorage.getItem("library");
    let library = JSON.parse(libraryString);
    let result;
    library.conditions.forEach(condition => {
      if (condition.code === code) {
        result = this._getBookInfoLine("condition", <UU5.Bricks.Lsi lsi={condition.name} />);
      }
    });
    return result;
  },

  //@@viewOff:private

  //@@viewOn:render
  render() {
    let { name, code, author, locationCode, state, conditionCode, genreCodes } = this.props.data;
    return (
      <UuP.Tiles.ActionTile
        {...this.getMainPropsToPass()}
        key={UU5.Common.Tools.generateUUID(4)}
        actionList={this._getTileActionList(this.props.data)}
        header={name}
        level={4}
        content={
          <UU5.Bricks.Div key={UU5.Common.Tools.generateUUID(4)}>
            {this._getBookInfoLine("author", author)}
            {this._getBookInfoLine("code", code)}
            {this._getBookInfoLine("location", locationCode)}
            {this._getBookInfoLine("state", <UU5.Bricks.Lsi lsi={Lsi[state]} />)}
            {this._getCondition(conditionCode)}
            {this._getGenre(genreCodes)}
          </UU5.Bricks.Div>
        }
      />
    );
  }
  //@@viewOff:render
});

export default BookTile;
