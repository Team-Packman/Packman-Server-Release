const message = {
  NULL_VALUE: '필요한 값이 없습니다',
  NOT_FOUND: '존재하지 않는 자원',
  BAD_REQUEST: '잘못된 요청',
  INTERNAL_SERVER_ERROR: '서버 내부 오류',
  INVALID_PARAMS: '유효하지 않은 파라미터 입니다',

  // 글자수 초과
  EXCEED_LENGTH: '제한된 글자수를 초과하였습니다',

  // 토큰 관련
  NULL_VALUE_TOKEN: '토큰이 없습니다',
  EXPIRED_TOKEN: '만료된 토큰입니다',
  ALL_EXPIRED_TOKEN: '모두 만료된 토큰입니다',
  VALID_TOKEN: '유효한 토큰입니다',
  INVALID_TOKEN: '유효하지 않은 토큰입니다',
  NO_USER_RF_TOKEN: '유저의 리프레쉬 토큰이 아닙니다',
  SUCCESS_REISSUE_TOKEN: '토큰 재발급 성공',
  SUCCESS_GET_TOKEN: '소셜 로그인 토큰 생성',
  SUCCESS_SOCIAL_LOGIN: '소셜 로그인 성공',

  // 유저 관련
  SUCCESS_CREATE_USER: '유저 생성 성공',
  FAIL_CREATE_USER: '유저 생성 실패',
  NO_USER: '존재하지 않는 유저입니다',
  SUCCESS_GET_USER: '유저 조회 성공',
  SUCCESS_UPDATE_USER: '유저 수정 성공',
  SUCCESS_DELETE_USER: '유저 탈퇴 성공',

  // 폴더 관련
  SUCCESS_CREATE_FOLDER: '폴더 생성 성공',
  SUCCESS_UPDATE_FOLDER: '폴더 수정 성공',
  SUCCESS_DELETE_FOLDER: '폴더 삭제 성공',
  SUCCESS_GET_FOLDERS: '폴더 조회 성공',
  NO_FOLDER: '존재하지 않는 폴더입니다',
  NO_USER_FOLDER: '유저에 존재하지 않는 폴더입니다',
  SUCCESS_GET_TOGETHER_FOLDERS: '함께 패킹리스트 폴더 조회 성공',
  SUCCESS_GET_ALONE_FOLDERS: '혼자 패킹리스트 폴더 조회 성공',
  SUCCESS_GET_TOGETHER_LIST_IN_FOLDER: '폴더 속 함께 패킹리스트 조회 성공',
  SUCCESS_GET_ALONE_LIST_IN_FOLDER: '폴더 속 혼자 패킹리스트 조회 성공',
  SUCCESS_GET_RECENT_CREATED_LIST: '최근 생성된 리스트 조회 성공',

  //패킹리스트 공통
  NO_LIST: '존재하지 않는 패킹리스트입니다',
  NO_ALONE_LIST: '존재하지 않는 혼자 패킹리스트입니다',
  NO_USER_LIST: '유저가 생성한 리스트가 없습니다',
  NO_UPDATEDTITLE: '존재하지 않는 UpdatedTitle입니다',
  NO_UPDATEDDATE: '존재하지 않는 UpdatedDepartureDate입니다',
  NO_UPDATEDMYTEMPLATE: '존재하지 않는 UpdatedIsSaved입니다',
  NO_FOLDER_LIST: '폴더에 존재하지 않는 패킹리스트입니다',
  DUPLICATION_LIST: '중복된 리스트 이름입니다',
  UPDATE_LIST_TITLE_SUCCESS: '패킹리스트 제목 수정 성공',
  UPDATE_LIST_DATE_SUCCESS: '패킹리스트 출발 날짜 수정 성공',
  UPDATE_LIST_MY_TEMPLATE_SUCCESS: '패킹리스트 나의 템플릿 여부 수정 성공',
  INVALID_LIST_TYPE: '유효하지 않은 리스트 타입입니다',

  //혼자 패킹리스트
  CREATE_ALONE_LIST_SUCCESS: '혼자 패킹리스트 생성 성공',
  CREATE_ALONE_CATEGORY_SUCCESS: '혼자 패킹리스트 카테고리 생성 성공',
  UPDATE_ALONE_CATEGORY_SUCCESS: '혼자 패킹리스트 카테고리 수정 성공',
  DELETE_ALONE_CATEGORY_SUCCESS: '혼자 패킹리스트 카테고리 삭제 성공',
  GET_INVITE_ALONE_LIST_SUCCESS: '공유된 혼자 패킹리스트 조회 성공',
  CREATE_ALONE_PACK_SUCCESS: '혼자 패킹리스트 짐 생성 성공',
  UPDATE_ALONE_PACK_SUCCESS: '혼자 패킹리스트 짐 수정 성공',
  DELETE_ALONE_PACK_SUCCESS: '혼자 패킹리스트 짐 삭제 성공',
  READ_ALONE_LIST_SUCCESS: '혼자 패킹리스트 상세 조회 성공',
  DELETE_ALONE_LIST_SUCCESS: '폴더 속 혼자 패킹리스트 삭제 성공',

  // 함께 패킹리스트 관련
  CREATE_TOGETHER_CATEGORY_SUCCESS: '함께 패킹리스트 카테고리 생성 성공',
  UPDATE_TOGETHER_CATEGORY_SUCCESS: '함께 패킹리스트 카테고리 수정 성공',
  DELETE_TOGETHER_CATEGORY_SUCCESS: '함께 패킹리스트 카테고리 삭제 성공',
  GET_INVITE_LIST_SUCCESS: '공유된 패킹리스트 조회 성공',
  CREATE_TOGETHER_PACK_SUCCESS: '함께 패킹리스트 짐 생성 성공',
  UPDATE_TOGETHER_PACK_SUCCESS: '함께 패킹리스트 짐 수정 성공',
  DELETE_TOGETHER_PACK_SUCCESS: '함께 패킹리스트 짐 삭제 성공',
  CREATE_TOGETHER_LIST_SUCCESS: '함께 패킹리스트 생성 성공',
  READ_TOGETHER_LIST_SUCCESS: '함께 패킹리스트 상세 조회 성공',
  DELETE_TOGETHER_LIST_SUCCESS: '폴더 속 함께 패킹리스트 삭제 성공',
  UPDATE_PACKER_SUCCESS: '함께 패킹리스트 담당자 배정 성공',

  // 짐
  NO_PACK: '존재하지 않는 짐입니다',
  NO_LIST_PACK: '패킹리스트에 존재하지 않는 짐입니다',
  NO_CATEGORY_PACK: '카테고리에 존재하지 않는 짐입니다',

  // 카테고리
  NO_CATEGORY: '존재하지 않는 카테고리입니다',
  NO_LIST_CATEGORY: '리스트에 존재하지 않는 카테고리입니다',
  DUPLICATED_CATEGORY: '중복된 카테고리 명입니다',

  //템플릿
  NO_TEMPLATE: '존재하지 않는 템플릿입니다',
  GET_ALONE_TEMPLATE_SUCCESS: '혼자 패킹 템플릿 리스트 조회 성공',
  GET_TOGETHER_TEMPLATE_SUCCESS: '함께 패킹 템플릿 리스트 조회 성공',
  NO_TEMPLATE_TYPE: '존재하지 않는 템플릿 형식입니다',

  // 초대 코드 관련
  SUCCESS_INVITE_TOGETHER_PACKING: '함께 패킹리스트 초대 성공',
  READ_DETAILED_TEMPLATE_SUCCESS: '템플릿 상세조회 성공',

  // 그룹
  NO_GROUP: '존재하지 않는 그룹입니다',
  SUCCESS_ADD_MEMBER: '그룹원 추가 성공',

  // 멤버
  SUCCESS_GET_MEMBER: '멤버 조회 성공',
  SUCCESS_DELETE_MEMBER: '멤버 삭제 성공',
  NO_MEMBER_USER: '멤버에 존재하지 않는 유저입니다',
  ALREADY_EXIST_MEMBER: '이미 추가된 멤버입니다',
  EMPTY_MEMBER: '멤버가 비어있습니다',
  NO_MAKER: '삭제할 권한이 없는 유저입니다',
  NO_DELETE_MAKER: '생성자는 삭제할 수 없습니다',

  // 랜딩
  DUPLICATED_PHONE: '이미 제출되었습니다!',
  SUCCESS_CREATE_LANDING_USER: '랜딩페이지 유저 생성 성공',

  // 엿보기
  SUCCESS_GET_HELP: '엿보기 조회 성공',
};

export default message;
