const axios = require('axios');

// Class
class TriviaWrapper {
  // User
  async register(user = {
    name: String,
    email: String,
    password: String,
  }) {
    console.log('Register');
    const endpoint = 'auth/register';
    const response = await this.api('POST', endpoint, user);
    return response.data;
  }

  async reset(user = {
    email: String,
  }) {
    console.log('Login');
    const endpoint = 'auth/reset';
    const response = await this.api('POST', endpoint, user);
    return response.data;
  }

  async login(user = {
    email: String,
    password: String,
  }) {
    console.log('Login');
    const endpoint = 'auth/login';
    const response = await this.api('POST', endpoint, user);
    return response.data;
  }

  async logout(params = null) {
    console.log('Logout');
    let endpoint = 'auth/logout';
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('POST', endpoint, null);
    return response.data;
  }

  // Trivia Question Categories
  async getCategories(params = null) {
    console.log('Fetching Categories');
    let endpoint = 'categories';
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getCategory(category = {
    id: String
  }) {
    console.log('Get Category');
    const endpoint = `categories/${category.id}`;
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async createCategory(category = {
    name: String,
    description: String,
  }) {
    console.log('Create Category');
    const endpoint = 'categories';
    const response = await this.api('POST', endpoint, category);
    return response.data;
  }

  async updateCategory(category = {
    id: String,
    name: String,
    description: String,
  }) {
    console.log('Update Category');
    const endpoint = `categories/${category.id}`;
    const response = await this.api('PUT', endpoint, category);
    return response.data;
  }

  async deleteCategories(categories = {
    ids: [String]
  }) {
    console.log('Delete Categories');
    const endpoint = 'categories/delete';
    const response = await this.api('POST', endpoint, categories);
    return response.data;
  }

  async deleteCategory(category = {
    id: String
  }) {
    console.log('Delete Category');
    const endpoint = `categories/${category.id}`;
    const response = await this.api('DELETE', endpoint, category);
    return response.data;
  }

  async cloneCategory(id) {
    console.log('Clone Category');
    const endpoint = 'categories/clone';
    const response = await this.api('POST', endpoint, id);
    return response.data;
  }

  // Trivia Questions
  async getQuestions(params = null) {
    console.log('Fetching Questions');
    let endpoint = 'questions';
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getRandomQuestions(params = null) {
    console.log('Fetching Random Questions');
    let endpoint = 'questions/random';
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getQuestion(question = {
    id: String
  }) {
    console.log('Get Question');
    const endpoint = `questions/${question.id}`;
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async createQuestion(question = {
    name: String,
    description: String,
  }) {
    console.log('Create Question');
    const endpoint = 'questions';
    const response = await this.api('POST', endpoint, question);
    return response.data;
  }

  async updateQuestion(question = {
    id: String,
    name: String,
    description: String,
  }) {
    console.log('Update Question');
    const endpoint = `questions/${question.id}`;
    const response = await this.api('PUT', endpoint, question);
    return response.data;
  }

  async deleteQuestions(questions = {
    ids: [String]
  }) {
    console.log('Delete Questions');
    const endpoint = 'questions/delete';
    const response = await this.api('POST', endpoint, questions);
    return response.data;
  }

  async deleteQuestion(question = {
    id: String
  }) {
    console.log('Delete Question');
    const endpoint = `questions/${question.id}`;
    const response = await this.api('DELETE', endpoint, question);
    return response.data;
  }

  async cloneQuestion(id) {
    console.log('Clone Question');
    const endpoint = 'questions/clone';
    const response = await this.api('POST', endpoint, id);
    return response.data;
  }

  // Trivias
  async getTrivias(params = null) {
    console.log('Fetching Trivias');
    let endpoint = 'trivias';
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getTrivia(trivia = {
    id: String
  }) {
    console.log('Get Trivia');
    const endpoint = `trivias/${trivia.id}`;
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getTriviaByHash(trivia = {
    hash: String
  }, params = null) {
    console.log('Get Trivia');
    let endpoint = `trivias/hash/${trivia.hash}`;
    endpoint += (params ? `?${params}` : '');
    const response = await this.api('GET', endpoint, null);
    return response.data;
  }

  async getTriviaQRCode(trivia = {
    url: String
  }) {
    console.log('Get Trivia QR Code');
    const endpoint = 'trivias/scan';
    const response = await this.api('POST', endpoint, trivia);
    return response.data;
  }

  async getTriviaAdminQRCode(trivia = {
    url: String,
    id: String
  }) {
    console.log('Get Admin Trivia QR Code');
    const endpoint = 'trivias/adminscan';
    const response = await this.api('POST', endpoint, trivia);
    return response.data;
  }

  async createTrivia(trivia = {
    name: String,
    description: String,
  }) {
    console.log('Create Trivia');
    const endpoint = 'trivias';
    const response = await this.api('POST', endpoint, trivia);
    return response.data;
  }

  async updateTrivia(trivia = {
    id: String,
    name: String,
    description: String,
  }) {
    console.log('Update Trivia');
    const endpoint = `trivias/${trivia.id}`;
    const response = await this.api('PUT', endpoint, trivia);
    return response.data;
  }

  async deleteTrivias(trivia = {
    ids: [String]
  }) {
    console.log('Delete Trivia');
    const endpoint = 'trivias/delete';
    const response = await this.api('POST', endpoint, trivia);
    return response.data;
  }

  async deleteTrivia(trivia = {
    id: String
  }) {
    console.log('Delete Trivia');
    const endpoint = `trivias/${trivia.id}`;
    const response = await this.api('DELETE', endpoint, trivia);
    return response.data;
  }

  async reopenTrivia(id) {
    console.log('Reopen Trivia');
    const endpoint = 'trivias/reopen';
    const response = await this.api('POST', endpoint, id);
    return response.data;
  }

  async cloneTrivia(id) {
    console.log('Clone Trivia');
    const endpoint = 'trivias/clone';
    const response = await this.api('POST', endpoint, id);
    return response.data;
  }

  api = async (method, endpoint, data = {}) => {
    try {
      if (!method || !endpoint) {
        throw new Error('You must pass a Trivia API method, and endpoint');
      }
      const url = `/api/trivia/${endpoint}`;
      console.log('API URL, data', endpoint, data);

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `${
            localStorage.getItem('token')
          }`
        }
      });
      console.log('API RESPONSE', response?.data);
      return response;
    } catch (error) {
      console.log('Error', JSON.stringify(error, null, 2));
      console.log('Error', error.message);
      throw new Error(error.message);
    }
  }
}

module.exports = TriviaWrapper;
