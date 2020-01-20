console.clear();

Vue.component('loadingComponent', {
  template: '#loadingComponentTemplate'
});

Vue.component('card-component', {
  template: '#CardsTemplate',
  props: {
    'cord-prpos': { Array },
    'star-status': { type: Boolean, default: false }
  },
  computed: {
    statusClass() {
      let status = this.cordPrpos.Status;
      switch(status) {
        case '良好':
          return '';
        case '普通':
          return 'status-aqi2';
        case '對敏感族群不健康':
          return 'status-aqi3';
        case '對所有族群不健康':
          return 'status-aqi4';
        case '非常不健康':
          return 'status-aqi5';
        case '危害':
          return 'status-aqi6';
        default:
          console.error('Unknon Status: ' + status);
          return '';
      }      
    },
    starClass() {
      return this.starStatus ? 'fas' : 'far';
    }
  },
  methods: {
    tempStarClick: function () {
      // 指定元件本身觸發函式 tempStarClick ，將元件本身 cordPrpos 向外層傳
      // console.log('tempStarClick()-cordPrpos', this.cordPrpos);
      this.$emit('card-emit', this.cordPrpos);
    },
  } 
});


var app = new Vue({
  el: '#app',
  data: {
    AJAX_data: [],
    isLoading: true,
    stared: [],
    selectCounty: '',
    staredToLocalStoragePath: 'vueStaredComponentList',
  },
  computed: {
    filterCounty() {
      const vm = this;

      /*----------  寫法一  ----------*/
      // const county = [];
      // vm.AJAX_data.forEach((item) => { 
      //   // 比對值是 -1 就為 true，將該筆物件過濾後推 county 陣列裡。
      //   if( county.indexOf(item.County) == -1 ){ county.push(item.County) };
      // });
      // return vm.locations = county;
      /*----------  /寫法一  ----------*/
      
      /*----------  寫法二  ----------*/
      // const county = [];
      // vm.AJAX_data.forEach(function (item) {
      //   // console.log('item.County', item.County);
      //   county.push(item.County);
      // });
      // return vm.locations = Array.from(new Set(county));
      /*----------  /寫法二  ----------*/
      
      /*----------  寫法三  ----------*/
      // const county = [];
      // vm.AJAX_data.forEach(function (item) {
      //   // console.log('item.County', item.County);
      //   county.push(item.County);
      // });
      // return vm.locations = [...new Set(county)];
      /*----------  /寫法三  ----------*/

      /*----------  寫法四  ----------*/
      /**
        * * .reduce 方法有二個部份，第一部份是函式，第二部份是預設資料。
        * * 第一部份函式(prev, item, index)，函式 prev 參數使用的是第二部份的預設資料。
        * * !reduceObj[County] 比對條件式立 (true)，也就是還沒有資料，資料是 reduceObj[County] = undefined ，陣列中的物件屬性值為數值 1。
        * * !reduceObj[County] 比對不條件式立 (false)，也就是有資料，陣列中的物件屬性值為數值再加 1，這樣的方式主要只是要看出重復加總起來的縣市筆數。
        * * Object.keys() 取物件方法將 Key 值 (屬性名稱) 轉為陣列，原本的物件資料屬性值 (加總縣市筆數) 不會帶入陣列中。
      */
      let reduceData = vm.AJAX_data.reduce( (reduceObj, { County }, index) => { 
        !reduceObj[County] ? (reduceObj[County]=1) : (reduceObj[County] = reduceObj[County]+1); 
        return reduceObj;
      }, {});
      return Object.keys( reduceData );
      /*----------  /寫法四  ----------*/
    },
    cardsData() {
      /*----------  寫法一  ----------*/
      /** 
        * ! 這樣的寫法是可以將資料過濾，但 computed 不能將 VueJS 實體內的資料指向重置，例如： this.data=[] ，強將 VueJS 內的資料做修改成空的陣列，這樣在 computed 還是只會針對取進的資料來源做運處。
        * * computed 只做將進來 VueJS 實體資料做畫面處理，可以使用過濾、解構等的資料處理的方法將資料做單一流處理後輸出到畫面使用。
      */

      // let vm = this;
      // const county = [];

      // if( vm.selectCounty === '' || vm.selectCounty === '全部市區'){
      //   vm.card_filterData = vm.AJAX_data
      // } else {
      //   vm.AJAX_data.forEach(function (item) {
      //     if( vm.selectCounty === item.County){
      //       vm.card_filterData = [];
      //       vm.card_filterData.push(item);
      //     }
      //   });
      // };
      // return [...vm.card_filterData] ;
      /*----------  /寫法一  ----------*/

      /*----------  寫法二  ----------*/
      const { AJAX_data, stared, selectCounty } = this;
      const filterCountyData = AJAX_data.filter( function ({ County, SiteName }) {
        // console.log('cardsData() - stared', stared);
        // console.log('cardsData() - SiteName', SiteName);
        // console.log('cardsData() - selectCounty', selectCounty);

        // .indexOf() 尋找是否有符合的字串字元 | 0~n 由找的字串比對的字元數算起, -1 完全找不到相關的字元
        // console.log('cardsData() - selectCounty.indexOf(SiteName) < 0 && County.indexOf(selectCounty) >= 0', selectCounty.indexOf(SiteName) < 0 && County.indexOf(selectCounty) >= 0);
        
        return stared.indexOf(SiteName) < 0 && County.indexOf(selectCounty) >= 0;
      } );

      const unfilterCountyData = AJAX_data.filter( function ({ County, SiteName }) {
        /**
          * ? 如果是在預設戴入或是在過濾完市區的選項下加入鄉鎮市區資料，例如：選 '基隆市 - 基隆' 加入關注鄉鎮市區 區塊中，在切到 '全部市區' 選項，在切回，此時下方的 [鄉鎮市區列表] 區塊就會在帶入 AJAX_data 的所有資料 (也就是未過濾的資料)，畫面會重復出現 '基隆市 - 基隆' 鄉鎮市區的資料在 [關注鄉鎮市區] 與 [鄉鎮市區列表] 二個區塊中。
          * * 比對 VueJS 實體下的 stared 陣列內的物件字串與 AJAX_data 陣列內的物件中有 County 屬性，如果都沒有比對到的字串資料，在執行回傳
        */

        return stared.indexOf(SiteName) == -1 && County.indexOf(selectCounty) == -1;
      });

      return (selectCounty == '全部市區') ? unfilterCountyData : filterCountyData ;
      /*----------  寫法二  ----------*/
    },
    staredData(){
      const { AJAX_data, stared } = this;
      const filterStaredData = AJAX_data.filter( function ({ SiteName }) {
        // console.log('staredData() - SiteName', SiteName);
        return stared.indexOf(SiteName) >= 0
      } );
      return filterStaredData;
    },
  },
  methods: {
    getAjaxData () {
      const vm = this;
      const proxyServerPath = 'https://cors-anywhere.herokuapp.com/';
      const openDataApiPath = 'http://opendata2.epa.gov.tw/AQI.json';
      const apiUrl = proxyServerPath + openDataApiPath;
      $.get(apiUrl).then( function (response, status, xhr) {
        // reponse 接到的 JSON 資料獎狀態
        // console.log('response', response, 'status', status, 'xhr', xhr);
        if( xhr.readyState === 4 ){
          vm.AJAX_data = response;
          setTimeout(() => {
            // 讓讀取動畫基本要跑 2 秒
            vm.isLoading = false;
          }, 2000);
          // vm.getLocalStorageStaredDB(response);
        };
      });
    },
    cardStarClick (item){
      const vm = this;
      // console.log('cardStarClick-item', item);
      console.log('cardStarClick() - item.SiteName', item.SiteName);
      
      const siteNameIndex = vm.stared.indexOf(item.SiteName);
      console.log('siteNameIndex', siteNameIndex);

      /** 
        * * 比對函式所傳進來的區名， .indexOf() 方法比對 stared 變數全筆資料，尋找是否有符合的物件 | 2 找到, -1 找不到
        * * 如果有找到條件成立 (2 >= 0)，將 stared 陣列資料內的物件區名對應索引值刪除
        * * 如果條件不成立 (-1 >= 0)，將 stared 陣列資料內推上一筆函式帶入的物件區名
      */
      console.log('cardStarClick() - siteNameIndex >= 0', siteNameIndex >= 0);
      siteNameIndex >= 0 ? vm.stared.splice(siteNameIndex, 1) : vm.stared.push(item.SiteName);

      // 將點按事件所加入的資料 VueJS 實體內的 stared 陣列，觸發後同時將資料寫入 localStorage 裡。
      vm.saveStaredToLocalStorage();
    },
    saveStaredToLocalStorage(){
      const vm = this;
      localStorage.setItem( vm.staredToLocalStoragePath, JSON.stringify(vm.stared));
    },
    getLocalStorageStaredDB(ajaxDataResponse){
      const vm = this;
      const localStorageData = JSON.parse(localStorage.getItem(vm.staredToLocalStoragePath));
      
      /*----------  寫法一  ----------*/
      /**
        * * 預要依賴於 getAjaxData () 裡透過取得 AJAX 資料後，將函式傳入參數 response -> ajaxDataResponse ，才能進行 getLocalStorageStaredDB () 函式內的比對資料的方法。
        * * 無法使用在 VueJS 的 created 生命週期內，直接執行函式 getLocalStorageStaredDB()
      */
      // localStorageData.forEach(function(item){
      //   ajaxDataResponse.forEach(function(el){
      //     if(item === el.SiteName){
      //       vm.stared.push(el.SiteName);
      //     }
      //   })
      // });
      /*----------  寫法一  ----------*/
      
      /*----------  寫法二  ----------*/
      /**
        * * 直接取出 localStorage 資料好解析 JSON 格式來比對資料
        * * 不會有 AJAX 非同步取得資料的問題，可以直接將 getLocalStorageStaredDB() 函式用於 VueJS 的 created 生命週期與 getAjaxData () 內。
      */
      try {
        (Array.isArray(localStorageData)) ? (vm.stared = localStorageData) : {} ;
      } catch (localStorageData) {
        console.error(localStorageData);
      }
      /*----------  /寫法二  ----------*/
    },
  },
  created () {
    const vm = this;
    vm.getAjaxData();
    vm.getLocalStorageStaredDB();
    vm.isLoading = true;
  }
});