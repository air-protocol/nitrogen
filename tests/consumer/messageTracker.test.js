const { messageSeen } = require('../../src/consumer/messageTracker')

test('messageSeen returns true when message already seen', () => {
    //Assemble
    messageSeen('uuid')

    //Action
    const result = messageSeen('uuid')

    //Assert
    expect(result).toBeTruthy()
})

test('messageSeen returns false when message not seen', () => {
    //Assemble

    //Action
    const result = messageSeen('another_uuid')

    //Assert
    expect(result).toBeFalsy()
})