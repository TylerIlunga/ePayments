class ProfileService {
  constructor() {
    this.businessURL =
      process.env.REACT_APP_EPAYMENTS_BUSINESS_PROFILE_SERVICE_URL;
    this.customerURL =
      process.env.REACT_APP_EPAYMENTS_CUSTOMER_PROFILE_SERVICE_URL;
  }
}

export default ProfileService;
