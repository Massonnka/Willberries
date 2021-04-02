// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const showAccessories = document.querySelectorAll('.show-accessories');
const showClothing = document.querySelectorAll('.show-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const cartClear = document.querySelector('.cart-clear');

const getGoods = async () => {
	const result = await fetch('db/db.json');
	if (!result.ok) {
		throw 'Ошибка:' + result.status
	}
	return await result.json();
};

const cart = {
	cartGoods: JSON.parse(localStorage.getItem('cartWilb')) || [],
	updateLocalStorage() {
		localStorage.setItem('cartWilb', JSON.stringify(this.cartGoods));
	},
	getCountCartGoods() {
		return this.cartGoods.length
	},
    countQuantity() {
        let totalGoods = this.cartGoods.reduce((sum, item) => {
            return sum + item.count;
        }, 0);
        if (totalGoods !== 0) {
			cartCount.textContent = totalGoods;
		} else {
			cartCount.textContent = ``;
		}
    }, 
	renderCart() {
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count }) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) => sum + item.price * item.count,0);
		cartTableTotal.textContent = totalPrice + '$'
	},
	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => id !== item.id)
		this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	minusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				if (item.count <= 1) {
					this.deleteGood(id)
				} else {
					item.count--;
				}
				break;
			}
		}
        this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	plusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count++;
				break;
			}
		}
        this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	addCartGoods(id) {
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price }) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1
					});
					this.updateLocalStorage();
                    this.countQuantity();
				});
		}
	},
	clearCart(){
		this.cartGoods = this.cartGoods.filter(item => item.id === "-1")
        this.countQuantity();
		this.updateLocalStorage();
		this.renderCart(); 
	}
}


//add to cart all buttons
document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');

	if (addToCart) {
		cart.addCartGoods(addToCart.dataset.id)
	}
})
//clear cart
cartClear.addEventListener('click', event =>  {
	cart.clearCart();
})
//delete on click
	cartTableGoods.addEventListener('click', event => {
		const target = event.target;
		if (target.tagName === "BUTTON") {
			const id = target.closest('.cart-item').dataset.id;

			if (target.classList.contains('cart-btn-delete')) {
				cart.deleteGood(id);
			};
	
			if (target.classList.contains('cart-btn-minus')) {
				cart.minusGood(id);
			}
	
			if (target.classList.contains('cart-btn-plus')) {
				cart.plusGood(id);
			}
		}
		
	})

	const openModal = () => {
		cart.renderCart();
		modalCart.classList.add('show')
	};
	
	const closeModal = () => {
		modalCart.classList.remove('show')
	};
	
	buttonCart.addEventListener('click', openModal);
	modalCart.addEventListener('click', event => {
		const target = event.target;
		if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
			closeModal()
		}
	})

// goods

	const createCard = function({ label, name, img, description, id, price}) {
		const card = document.createElement('div');
		card.className = 'col-lg-3 col-sm-6'

		card.innerHTML = `
		<div class="goods-card">
		${label ?
				`<span class="label">${label}</span>` :
				''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>
		`;

		return card;
	};

	const renderCards = function(data) {
		longGoodsList.textContent = '';
		const cards = data.map(createCard)
		longGoodsList.append(...cards)
		document.body.classList.add('show-goods')
	};
	more.addEventListener('click', event => {
		event.preventDefault();
		const id = more.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
		getGoods().then(renderCards);
	});

	const filterCards = function(field, value) {
		getGoods()
			.then(data => data.filter(good => good[field] === value))
			.then(renderCards);
	};

	navigationLink.forEach(function (link) {
		link.addEventListener('click', event => {
			event.preventDefault();
			const field = link.dataset.field;
			const value = link.textContent;
			if (value != 'All') {
				filterCards(field, value);
			}
			else  {
				getGoods().then(renderCards);
			}
		});
	});

	showAccessories.forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			const id = item.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
			filterCards('category', 'Accessories');
		});
	});
	showClothing.forEach(item => {
		item.addEventListener('click', event => {
			event.preventDefault();
			const id = item.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
			filterCards('category', 'Clothing');
		});
	});


const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('./server.php', {
	method: 'POST',
	headers: {
		'Content-Type' : 'application/json'
	},
	body: dataUser,
});

const validForm = (formData) => {
	let valid = false;
	for (const [, value] of formData) {
		if (value.trim()) {
			valid = true;
		} else {
			valid = false;
			break;
		}
	}
	return valid;
}


modalForm.addEventListener('submit', event => {
	event.preventDefault();
	const formData = new FormData(modalForm);
	
	if (validForm(formData) && cart.getCountCartGoods()) {
		const data = {};

		for (const [name, value] of formData) {
			data[name] = value;
		}

		data.cart = cart.cartGoods

		postData(JSON.stringify(data))
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status);
				}
				alert('Ваш заказ успешно отправлен, с вами свяжутся в ближайшее время')
				console.log(response.statusText);
			})
			.catch(err => {
				alert('К сожалению произошла ошибка, повторите попытку позже')
				console.error(err);
			})
			.finally(() => {
				closeModal();
				modalForm.reset();
				cart.clearCart();
			});
	} else {
		if (!cart.getCountCartGoods()) {
			alert('Добавьте товары в корзину');
		}
		if (!validForm(formData)) {
			alert('Заполните поля правильно');
		}
	}

});