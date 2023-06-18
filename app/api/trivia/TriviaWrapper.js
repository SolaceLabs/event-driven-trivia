const axios = require('axios');

// Class
class TriviaWrapper {
  // User
  async register(user) {
    console.log('Register');
    const response = await this.api('POST', 'auth/register', user);
    return response.data;
  }

  async login(user) {
    console.log('Login');
    const response = await this.api('POST', 'auth/login', user);
    return response.data;
  }

  async logout() {
    console.log('Logout');
    const response = await this.api('POST', 'auth/logout');
    return response.data;
  }

  async isAdmin(user) {
    console.log('Check if Administrator');
    const response = await this.api('POST', 'auth/is-admin', user);
    return response.data;
  }

  async resendAccountActivation(user) {
    console.log('Resend email verification link');
    const response = await this.api('POST', 'auth/resend-account-activation', user);
    return response.data;
  }

  async activateAccount(user) {
    console.log('Activate account');
    const response = await this.api('POST', 'auth/account-activation', user);
    return response.data;
  }

  async sendResetPassword(user) {
    console.log('Send reset password link');
    const response = await this.api('POST', 'auth/send-reset-password', user);
    return response.data;
  }

  async resetPassword(user) {
    console.log('Reset');
    const response = await this.api('POST', 'auth/reset-password', user);
    return response.data;
  }

  // Trivia Members
  async getMembers(params = null) {
    console.log('Fetching Members');
    const response = await this.api('GET', 'members' + (params ? `?${params}` : ''));
    return response.data;
  }

  async getMember(member) {
    console.log('Get Member');
    const response = await this.api('GET', `members/${member.id}`);
    return response.data;
  }

  async updateMember(member) {
    console.log('Update Member');
    const response = await this.api('PUT', `members/${member.id}`, member);
    return response.data;
  }

  async deleteMembers(members) {
    console.log('Delete Members');
    const response = await this.api('POST', 'members/delete', members);
    return response.data;
  }

  async deleteMember(member) {
    console.log('Delete Member');
    const response = await this.api('DELETE', `members/${member.id}`);
    return response.data;
  }

  // Trivia Question Categories
  async getCategories(params = null) {
    console.log('Fetching Categories');
    const response = await this.api('GET', 'categories' + (params ? `?${params}` : ''));
    return response.data;
  }

  async getCategory(category) {
    console.log('Get Category');
    const response = await this.api('GET', `categories/${category.id}`);
    return response.data;
  }

  async createCategory(category) {
    console.log('Create Category');
    const response = await this.api('POST', 'categories', category);
    return response.data;
  }

  async updateCategory(category) {
    console.log('Update Category');
    const response = await this.api('PUT', `categories/${category.id}`, category);
    return response.data;
  }

  async deleteCategories(categories) {
    console.log('Delete Categories');
    const response = await this.api('POST', 'categories/delete', categories);
    return response.data;
  }

  async deleteCategory(category) {
    console.log('Delete Category');
    const response = await this.api('DELETE', `categories/${category.id}`);
    return response.data;
  }

  async cloneCategory(category) {
    console.log('Clone Category');
    const response = await this.api('POST', `categories/clone/${category.id}`);
    return response.data;
  }

  // Trivia Questions
  async getQuestions(params = null) {
    console.log('Fetching Questions');
    const response = await this.api('GET', 'questions' + (params ? `?${params}` : ''));
    return response.data;
  }

  async getRandomQuestions(params = null) {
    console.log('Fetching Random Questions');
    const response = await this.api('GET', 'questions/random' + (params ? `?${params}` : ''));
    return response.data;
  }

  async getQuestion(question) {
    console.log('Get Question');
    const response = await this.api('GET', `questions/${question.id}`);
    return response.data;
  }

  async createQuestion(question) {
    console.log('Create Question');
    const response = await this.api('POST', 'questions', question);
    return response.data;
  }

  async updateQuestion(question) {
    console.log('Update Question');
    const response = await this.api('PUT', `questions/${question.id}`, question);
    return response.data;
  }

  async toggleQuestions(questions) {
    console.log('Delete Questions');
    const response = await this.api('POST', 'questions/delete', questions);
    return response.data;
  }

  async toggleQuestion(question) {
    console.log('Delete Question');
    const response = await this.api('DELETE', `questions/${question.id}`);
    return response.data;
  }

  async cloneQuestion(question) {
    console.log('Clone Question');
    const response = await this.api('POST', `questions/clone/${question.id}`);
    return response.data;
  }

  // Trivias
  async getTrivias(params = null) {
    console.log('Fetching Trivias');
    const response = await this.api('GET', 'trivias' + (params ? `?${params}` : ''));
    return response.data;
  }

  async getTrivia(trivia) {
    console.log('Get Trivia');
    const response = await this.api('GET', `trivias/${trivia.id}`);
    return response.data;
  }

  async getTriviaByHash(trivia) {
    console.log('Get Trivia');
    const response = await this.api('GET', `trivias/hash/${trivia.hash}`);
    return response.data;
  }

  async getTriviaQRCode(trivia) {
    console.log('Get Trivia QR Code');
    const response = await this.api('POST', 'trivias/scan', trivia);
    return response.data;
  }

  async getTriviaAdminQRCode(trivia) {
    console.log('Get Admin Trivia QR Code');
    const response = await this.api('POST', 'trivias/adminscan', trivia);
    return response.data;
  }

  async createTrivia(trivia) {
    console.log('Create Trivia');
    const response = await this.api('POST', 'trivias', trivia);
    return response.data;
  }

  async updateTrivia(trivia) {
    console.log('Update Trivia');
    const response = await this.api('PUT', `trivias/${trivia.id}`, trivia);
    return response.data;
  }

  async deleteTrivias(trivia) {
    console.log('Delete Trivia');
    const response = await this.api('POST', 'trivias/delete', trivia);
    return response.data;
  }

  async deleteTrivia(trivia) {
    console.log('Delete Trivia');
    const response = await this.api('DELETE', `trivias/${trivia.id}`, trivia);
    return response.data;
  }

  async reopenTrivia(trivia) {
    console.log('Reopen Trivia');
    const response = await this.api('POST', `trivias/reopen/${trivia.id}`);
    return response.data;
  }

  async cloneTrivia(trivia) {
    console.log('Clone Trivia');
    const response = await this.api('POST', `trivias/clone/${trivia.id}`);
    return response.data;
  }

  api = async (method, endpoint, data = null) => {
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
