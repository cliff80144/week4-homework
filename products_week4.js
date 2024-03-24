import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

// const url = 'https://vue3-course-api.hexschool.io/v2';
// const path = 'cliffwu-vueapi';

let productModal = null;
let delProductModal = null;


const app = createApp({
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/v2',
            apiPath: 'cliffwu-vueapi',
            products: [],
            isNew: false,
            tempProduct: {
                imagesUrl: [],
            },
            pagination: {},
        }
    },
    methods: {
        checkAdmin() {
            const url = `${this.apiUrl}/api/user/check`;
            axios.post(url)
                .then((res) => {
                    console.log('驗證成功');
                    // !!!!驗證成功才從這裡取得資料
                    this.getData();
                })
                .catch((err) => {
                    alert(err.response.data.message);
                    console.log('驗證失敗');
                    window.location = 'login_week4.html';//驗證失敗轉址退回
                })
        },
        getData(page = 1) { //參數預設值
            const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;//有分頁的(為了第四周)
            axios.get(url).then((res) => {

                this.products = res.data.products;
                console.log(res);

                //先把資料存回來到data裡面
                this.pagination = res.data.pagination;

            }).catch((err) => {
                alert(err.response.data.message);
            })
        },

        openModal(isNew, item) {
            // console.log('成功');
            //編輯-getData()、updateProduct()，藉由判斷式來區分共用
            if (isNew === 'new') {
                this.tempProduct = {
                    imagesUrl: [],
                };
                this.isNew = true;
                productModal.show();
            } else if (isNew === 'edit') {
                this.tempProduct = { ...item };
                if (!Array.isArray(this.tempProduct.imagesUrl)) {
                    this.tempProduct.imagesUrl = [];
                }
                this.isNew = false;
                productModal.show();
            } else if (isNew === 'delete') {
                this.tempProduct = { ...item };
                delProductModal.show()
            }
        },
    },
    //生命週期(初始化，可以用的全域的東西)
    mounted() {
        // console.log(text);
        //取出cookie中的token
        const token = document.cookie.replace(
            /(?:(?:^|.*;\s*)cliffToken\s*\=\s*([^;]*).*$)|^.*$/,
            "$1",
        );
        // 把cookie存在axios預設裡面，就不用重複帶入token來驗證
        axios.defaults.headers.common['Authorization'] = token;
        this.checkAdmin();//在進入頁面後呼叫驗證
    },


});

// 分頁元件
app.component('pagination', {
    template: '#pagination',
    props: ['pages'],
    methods: {
        emitPages(item) {
            this.$emit('emit-pages', item);
        },
    },
});

// 產品新增/編輯元件
app.component('productModal', {
    template: '#productModal',
    props: ['product', 'isNew'],
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/v2',
            apiPath: 'cliffwu-vueapi',
        };
    },
    mounted() {
        //modal開啟 bs 用id
        productModal = new bootstrap.Modal(document.getElementById('productModal'), {
            keyboard: false,
            backdrop: 'static'
        });
    },
    methods: {
        //確認按鈕 -濃縮更新、新增兩個的確認鍵
        updateProduct() {
            // 新增商品
            let api = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
            let httpMethod = 'post';
            // 當不是新增商品時則切換成編輯商品 API  更新後put
            if (!this.isNew) {
                api = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.product.id}`;
                httpMethod = 'put';
            }

            axios[httpMethod](api, { data: this.product }).then((response) => {
                alert(response.data.message);
                this.hideModal();//新增成功後關掉
                this.$emit('update');
            }).catch((err) => {
                alert(err.response.data.message);
            });
        },
        createImages() {
            this.product.imagesUrl = [];
            this.product.imagesUrl.push('');
        },
        openModal() {
            productModal.show();
        },

        hideModal() {
            productModal.hide();
        },
    },
})
// 產品刪除元件
app.component('delProductModal', {
    template: '#delProductModal',
    props: ['item'],
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/v2',
            apiPath: 'cliffwu-vueapi',
        };
    },
    mounted() {
        //modal開啟 bs 用id
        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
            keyboard: false,
            backdrop: 'static',
        });
    },
    methods: {
        delProduct() {
            axios.delete(`${this.apiUrl}/api/${this.apiPath}/admin/product/${this.item.id}`).then((response) => {
                this.hideModal();//刪除成功後就關掉
                this.$emit('update');
            }).catch((err) => {
                alert(err.response.data.message);
            });
        },
        openModal() {
            delProductModal.show();
        },
        hideModal() {
            delProductModal.hide();
        },
    },
});
app.mount('#app');