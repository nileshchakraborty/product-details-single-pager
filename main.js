var eventBus = new Vue()
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    `
})
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    template: `
    <div class="product">

        <div class="product-image">
            <img :src="image" style="height: 150px;width: 100px;word-wrap: inherit;" />
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <a :href="link+product" target="_blank">More products like this</a>
            <p v-if="inventory>10 && inStock">In Stock</p>
            <p v-else-if="inventory<=10 && inventory>0 && inStock">Almost out of stock</p>
            
            <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
            
            <p v-show="inStock">Buy Now</p>
            <p>{{ sale }}</p>

            <info-tabs :shipping="shipping" :details="details"></info-tabs>
            
            <div class="color-box" 
                v-for="(varient, index) in varients" 
                :key="varient.varientId" 
                :style="{ backgroundColor: varient.varientColor }"
                @mouseover="updateProduct(index)" 
                @click="updateProduct(index)">
            </div>

            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            <div class="product-description">
                <h3>{{ discription.concat(product) }}</h3>
            </div>
            
            <div class="btn">
                <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
                    Add to Cart
                </button>
                

                <button v-on:click="removeFromCart">
                    Remove From Cart
                </button>
            </div>

            <product-tabs :reviews="reviews"></product-tabs>
            
        </div>
    </div>
    `,
    data() {
        return {

            product: 'Socks',
            brand: "Vue Sitter",
            discription: 'discription of ',
            link: 'https://www.google.com/search?safe=active&q=',
            selectedVariant: 0,
            inventory: 10,
            onSale: true,

            varients: [{
                    varientID: 2201,
                    varientColor: "green",
                    varientImage: "./assets/vmSocks-green.png",
                    variantQuantity: 10
                },
                {
                    varientID: 2202,
                    varientColor: "blue",
                    varientImage: "./assets/vmSocks-blue.png",
                    variantQuantity: 0
                }
            ],
            sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            reviews: []

        }
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.varients[this.selectedVariant].variantID)
        },
        updateProduct: function (index) {
            this.selectedVariant = index
        },
        removeFromCart: function () {
            this.$emit('remove-from-cart', this.varients[this.selectedVariant].variantID)
        }
    },
    computed: {
        title() {
            return this.brand + " " + this.product
        },
        image() {
            return this.varients[this.selectedVariant].varientImage
        },
        inStock() {
            return this.varients[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!'
            }
            return this.brand + ' ' + this.product + ' are not on sale'
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })   
    }

})
Vue.component('product-review', {
    template: `
      <form class="review-form" @submit.prevent="onSubmit">
      
        <p class="error" v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors">{{ error }}</li>
          </ul>
        </p>

        <p>
          <label for="name">Name:</label>
          <input id="name" v-model="name">
        </p>
        
        <p>
          <label for="review">Review:</label>      
          <textarea id="review" v-model="review"></textarea>
        </p>
        
        <p>
          <label for="rating">Rating:</label>
          <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
          </select>
        </p>
        
        <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>
            
        <p>
          <input type="submit" value="Submit">  
        </p>    
      
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})
Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: false
      }
    },
    template: `
      <div>
      
        <div>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                :key="index"
                @click="selectedTab = tab"
          >{{ tab }}</span>
        </div>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="review in reviews">
                  <p>Name: {{ review.name }}</p>
                  <p>Rating: {{ review.rating }}</p>
                  <p>Review: {{ review.review }}</p>
                  <p>Recommended: {{ review.recommend}}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })

  Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart: function (id) {
            this.cart.push(id)
        },
        removeCart: function (id) {
            for (var i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }

    }
})