const customersList = document.querySelector('.customers-list')
const telephoneInput = document.querySelector('#telephoneInput')
const usernameInput = document.querySelector('#usernameInput')
const customerName = document.querySelector('.customer-name')
const foodsSelect = document.querySelector('#foodsSelect')
const ordersList = document.querySelector('.orders-list')
const foodsCount = document.querySelector('#foodsCount')
const foodsForm = document.querySelector('#foodsForm')
const clientId = document.querySelector('#clientId')
const userAdd = document.querySelector('#userAdd')

const API = 'https://foodorderbackendrestapi.herokuapp.com'

async function renderUsers () {
	let response = await fetch(API + '/users')
	const users = await response.json()
	customersList.innerHTML = null
	for(let user of users) {
		const [li, span, a] = createElements('li', 'span', 'a')
		
		li.classList.add('customer-item')
		span.classList.add('customer-name')
		a.classList.add('customer-phone')

		a.setAttribute('href', 'tel:+' + user.contact)

		span.textContent = user.username
		a.textContent = '+' + user.contact

		li.append(span, a)
		customersList.append(li)

		li.addEventListener('click', event => {
			customerName.textContent = user.username
			clientId.textContent = user.user_id

			window.localStorage.setItem('userId', user.user_id)
			window.localStorage.setItem('username', user.username)

			renderOrders(user.user_id)
		})
	}
}


async function renderFoods () {
	let respone = await fetch(API + '/foods')
	let foods = await respone.json()

	for(let food of foods) {
		const [option] = createElements('option')
		
		option.value = food.food_id
		option.textContent = food.food_name

		foodsSelect.append(option)
	}
}


async function renderOrders (userId) {
	if(!userId) return
	let response = await fetch(API + '/orders?userId=' + userId)
	const orders = await response.json()

	ordersList.innerHTML = null
	for(let order of orders) {
		const food = order.food

		const [liEl, imgEl, divEl, nameEl, countEl] = createElements('li', 'img', 'div', 'span', 'span')
		
		liEl.classList.add('order-item')
		nameEl.classList.add('order-name')
		countEl.classList.add('order-count')

		imgEl.setAttribute('src',food.food_img)

		nameEl.textContent = food.food_name
		countEl.textContent = order.count

		divEl.append(nameEl, countEl)
		liEl.append(imgEl, divEl)
		ordersList.append(liEl)
	}
}


async function addUser (event) {
	event.preventDefault()

	const username = usernameInput.value.trim()
	const contact = telephoneInput.value.trim()

	if(!username || username.length > 30) {
		return alert('Invalid username!')
	}

	if(!(/^998(9[012345789]|3[3]|7[1]|8[8])[0-9]{7}$/).test(contact)) {
		return alert('Invalid contact!')
	}

	const newUser = {
		username,
		contact
	}
	await fetch(API + '/users', {
		method: 'POST',
		headers:{
			"Content-Type": "application/json"
		},
		body: JSON.stringify(newUser)
	})

	return renderUsers()
}


async function addOrder (event) {
	event.preventDefault()

	const foodId = foodsSelect.value.trim()
	const count = foodsCount.value.trim()
	const userId = clientId.textContent.trim()
	console.log(foodId);


	if(
		!count ||
		+count > 10 ||
		!userId
	) return

	await fetch(API + '/orders', {
		method: 'POST',
		headers:{
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			foodId, userId, count
		})
	})
	return renderOrders(userId)
}

const userId = window.localStorage.getItem('userId')
const username = window.localStorage.getItem('username')

userId && (clientId.textContent = userId)
username && (customerName.textContent = username)


renderUsers()
renderFoods()
renderOrders(userId)


userAdd.addEventListener('submit', addUser)
foodsForm.addEventListener('submit', addOrder)