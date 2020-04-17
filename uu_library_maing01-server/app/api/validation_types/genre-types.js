/* eslint-disable */
const codeType = string(/^[0-9a-zA-Z_\-]{2,64}$/);

const genreCreateDtoInType = shape({
  code: codeType().isRequired(),
  name: string().isRequired()
});
const genreDeleteDtoInType = shape({
  code: codeType().isRequired()
});
const genreListDtoInType = shape({
  pageInfo: shape({
    pageIndex: integer(),
    pageSize: integer()
  })
});
const genreGetDtoInType = shape({
  code: codeType().isRequired()
});
