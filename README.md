## 🧳 Packman
> 내 손안의 짐 챙김 도우미, 팩맨  
2022.07.02 ~ 2022.10.07

## 🧳 Server Architecture
<img src="https://img.shields.io/badge/TypeScript-2d79c7?style=flat-square&logo=TypeScript&logoColor=white"/> <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=Express&logoColor=white"/> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white"/>
<img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=AmazonAWS&logoColor=white"/> <br>
</br>
## 🧳 Contributors  

|           박현지                             |                            김경린                           |                            장서희                           |
| :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="https://user-images.githubusercontent.com/63945197/178551981-6bb59e08-226e-4541-bfc8-784142d87c68.png" width="300"/> | <img src="https://user-images.githubusercontent.com/63945197/178552234-ea3bb0e4-5128-4f09-8a34-51c3d730f41b.png" width="300"/>  | <img src="https://user-images.githubusercontent.com/63945197/178552668-9e2f1d2f-65c6-435c-b682-fe39796e64d8.png" width="300"/>  
|              [dingding-21](https://github.com/dingding-21)               |             [kkl4846](https://github.com/kkl4846)              |             [laalaa31](https://github.com/laalaa31)              |
<hr>
<br/>

## 🧳 Service Core Function
![20](https://user-images.githubusercontent.com/102424704/180459110-ed7660bc-c55e-4e6b-be12-d837b7d05d3d.jpg)
![21](https://user-images.githubusercontent.com/102424704/180459121-5c7b7223-c22a-4df4-ad21-42fa89f5e68a.jpg)
![22](https://user-images.githubusercontent.com/102424704/180459130-eebb33f5-6d3e-412f-9a0b-644ca9aab29d.jpg)
![23](https://user-images.githubusercontent.com/102424704/180459142-0c62cffd-7966-403c-a46b-5d2ad1895f36.jpg)
![24](https://user-images.githubusercontent.com/102424704/180459150-e00212ac-376f-43db-ae79-12af5efce613.jpg)
![25](https://user-images.githubusercontent.com/102424704/180459156-c7f313c8-ba31-46f0-bd1f-949dc5fe692a.jpg)
![26](https://user-images.githubusercontent.com/102424704/180459169-491dfd5b-70eb-49e3-8fa1-3cdacd109166.jpg)
![27](https://user-images.githubusercontent.com/102424704/180459176-6724af15-9388-4fea-be1e-65153ab058c5.jpg)
![28](https://user-images.githubusercontent.com/102424704/180459183-1b736428-02c6-47e9-9e89-81bc78a08d60.jpg)
<hr>
<br/>

## 🧳 API Docs

### 🔗 [API Docs](https://freezing-innovation-7f5.notion.site/API-ver-1-0914779ec2404484acc8f63a36e272dd)

<hr>
<br/>

## 🧳   Code Covention

<details>
<summary>명명규칙(Naming Conventions)</summary>
<div markdown="1">

1. 이름으로부터 의도가 읽혀질 수 있게 쓴다.
- ex)

    ```jsx
    // bad
    function q() {
      // ...stuff...
    }
    
    // good
    function query() {
      // ..stuff..
    }
    
    ```
    
2. 오브젝트, 함수, 그리고 인스턴스에는 `camelCase`를 사용한다.
- ex)
    
    ```jsx
    // bad
    const OBJEcttsssss = {};
    const this_is_my_object = {};
    function c() {}
    
    // good
    const thisIsMyObject = {};
    function thisIsMyFunction() {}
    
    ```
    
3. 클래스나 constructor에는 `PascalCase`를 사용한다.
- ex)
    
    ```jsx
    // bad
    function user(options) {
      this.name = options.name;
    }
    
    const bad = new user({
      name: 'nope',
    });
    
    // good
    class User {
      constructor(options) {
        this.name = options.name;
      }
    }
    
    const good = new User({
      name: 'yup',
    });
    
    ```
    
4. 함수 이름은 동사 + 명사 형태로 작성한다.
ex) `postUserInformation( )`
5. 약어 사용은 최대한 지양한다.
6. 이름에 네 단어 이상이 들어가면 팀원과 상의를 거친 후 사용한다
</div>
</details>

<details>
<summary>블록(Blocks)</summary>
<div markdown="1">

1. 복수행의 블록에는 중괄호({})를 사용한다.
- ex)
    
    ```jsx
    // bad
    if (test)
      return false;
    
    // good
    if (test) return false;
    
    // good
    if (test) {
      return false;
    }
    
    // bad
    function() { return false; }
    
    // good
    function() {
      return false;
    }
    
    ```
    
2. 복수행 블록의 `if` 와 `else` 를 이용하는 경우 `else` 는 `if` 블록 끝의 중괄호( } )와 같은 행에 위치시킨다.
- ex)
    
    ```java
    // bad
    if (test) {
      thing1();
      thing2();
    } 
    else {
      thing3();
    }
    
    // good
    if (test) {
      thing1();
      thing2();
    } else {
      thing3();
    }
    
    ```
</div>
</details>

<details>
<summary>코멘트(Comments)</summary>
<div markdown="1">

1. 복수형의 코멘트는 `/** ... */` 를 사용한다.
- ex)
    
    ```jsx
    // good
    /**
     * @param {String} tag
     * @return {Element} element
     */
    function make(tag) {
      // ...stuff...
    
      return element;
    }
    
    ```
    
2. 단일 행의 코멘트에는 `//` 을 사용하고 코멘트를 추가하고 싶은 코드의 상부에 배치한다. 그리고 코멘트의 앞에 빈 행을 넣는다.
- ex)
    
    ```jsx
    // bad
    const active = true; // is current tab
    
    // good
    // is current tab
    const active = true;
    
    // good
    function getType() {
      console.log('fetching type...');
    
      // set the default type to 'no type'
      const type = this._type || 'no type';
    
      return type;
    }
    
    ```
</div>
</details>

<details>
<summary>문자열(Strings)</summary>
<div markdown="1">

1. 문자열에는 싱크쿼트 `''` 를 사용한다.
- ex)
    
    ```jsx
    // bad
    const name = "Capt. Janeway";
    
    // good
    const name = 'Capt. Janeway';
    ```
    
2. 프로그램에서 문자열을 생성하는 경우는 문자열 연결이 아닌 `template strings`를 이용한다.
- ex)
    
    ```jsx
    // bad
    function sayHi(name) {
      return 'How are you, ' + name + '?';
    }
    
    // bad
    function sayHi(name) {
      return ['How are you, ', name, '?'].join();
    }
    
    // good
    function sayHi(name) {
      return `How are you, ${name}?`;
    }
    
    ```
</div>
</details>

<details>
<summary>함수(Functions)</summary>
<div markdown="1">

1. 화살표 함수를 사용한다.
- ex)
    
    ```jsx
     var arr1 = [1, 2, 3];
      var pow1 = arr.map(function (x) { // ES5 Not Good
        return x * x;
      });
    
      const arr2 = [1, 2, 3];
      const pow2 = arr.map(x => x * x); // ES6 Good
    ```
    
</div>
</details>

<details>
<summary>조건식과 등가식(Comparison Operators & Equality)</summary>
<div markdown="1">

1. `==` 이나 `!=` 보다 `===` 와 `!==` 을 사용한다.
2. 단축형을 사용한다.
- ex)
    
    ```jsx
    // bad
    if (name !== '') {
      // ...stuff...
    }
    
    // good
    if (name) {
      // ...stuff...
    }
    ```
    
3. 비동기 함수를 사용할 때 `Promise`함수의 사용은 지양하고 `async`, `await`를 쓰도록 한다
</div>
</details>

<hr>
</br>

## 🧳 Branch

<aside>
🌱 git branch 전략

`main branch` : 배포 단위 branch

`develop branch` : 주요 개발 branch, main merge 전 거치는 branch

`feature branch`: 각자 개발 branch

- 할 일 issue 등록 후 issue 번호로 branch 생성 후 작업
    - ex) feature/#`issue num`
- 해당 branch 작업 완료 후 PR 보내기
    - 항상 local에서 충돌 해결 후 → remote에 올리기
    - reviewer에 서로 tag후 code-review
    - comment 전 merge 불가!

 ### branch 구조

```jsx
- main
- develop
- feature
   ├── #1
   └── #2
```

</aside>
<hr>
</br>

## 🧳 Commit Convention

<aside>
👻 git commit message convention

`ex) [FEAT]/#`issue num` User API 파일 추가` 

```ruby
- [CHORE]: 코드 수정, 내부 파일 수정
- [FEAT] : 새로운 기능 구현
- [ADD] : Feat 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성 시
- [FIX] : 버그, 오류 해결
- [DEL] : 쓸모없는 코드 삭제
- [DOCS] : README나 WIKI 등의 문서 개정
- [MOVE] : 프로젝트 내 파일이나 코드의 이동
- [RENAME] : 파일 이름의 변경
- [MERGE]: 다른브렌치를 merge하는 경우
- [STYLE] : 코드가 아닌 스타일 변경을 하는 경우
- [INIT] : Initial commit을 하는 경우
```
