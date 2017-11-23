import faker from 'faker' // eslint-disable-line

const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1)

const generateDataItem = index => ({
  id: index,
  color: faker.internet.color(),
  avatar: faker.image.avatar(),
  age: faker.random.number({ min: 20, max: 60 }),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  // job
  job: faker.name.jobDescriptor(),
  jobArea: faker.name.jobArea(),
  jobType: faker.name.jobType(),
  jobTitle: faker.name.jobTitle(),
  // address
  city: faker.address.city(),
  street: faker.address.streetName(),
  building: ucfirst(faker.lorem.word()),
  doorNo: faker.random.number({ min: 1000, max: 9999 }),
  zipCode: faker.address.zipCode(),
  // company
  companyName: faker.company.companyName(),
  companyAddress: faker.address.streetName(),
  catchPhrase: faker.company.catchPhrase(),
})

export default generateDataItem
