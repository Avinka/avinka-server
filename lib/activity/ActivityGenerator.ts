import {Activity} from "./activity";

export class ActivityGenerator {

    static generate(): Activity {
        let activity: Activity = new Activity();
        if (Math.random() < 0.25) {
            activity.actor = {'id': 'P:123', 'type': 'Person'};
            activity.type = 'Login';
            activity.object = {'id': 'Bot:123', 'type': 'Bot'};
        } else if (Math.random() > 0.25 && Math.random() < 0.5) {
            activity.actor = {'id': 'S:123', 'type': 'Service'};
            activity.type = 'Sends';
            activity.object = {'id': 'U:123', 'type': 'Email'};
        } else if (Math.random() > 0.5 && Math.random() < 0.75) {
            activity.actor = {'id': 'S:123', 'type': 'User'};
            activity.type = 'Presses';
            activity.object = {'id': 'U:123', 'type': 'ButtonA'};
        } else if (Math.random() > 0.75) {
            activity.actor = {'id': 'S:123', 'type': 'User'};
            activity.type = 'Presses';
            activity.object = {'id': 'U:123', 'type': 'ButtonB'};
        }
        activity.published = ActivityGenerator.getRandomDate().toISOString();
        return activity;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomDate(): Date {
        const randomIntHour = ActivityGenerator.getRandomInt(1, 23);
        const hour = randomIntHour < 10 ? '0' + randomIntHour : randomIntHour;

        const randomIntMinute = ActivityGenerator.getRandomInt(1, 59);
        const minute = randomIntMinute < 10 ? '0' + randomIntMinute : randomIntMinute;

        const randomIntSecond = ActivityGenerator.getRandomInt(1, 59);
        const second = randomIntSecond < 10 ? '0' + randomIntSecond : randomIntSecond;
        const date = new Date(2018, ActivityGenerator.getRandomInt(7, 11), ActivityGenerator.getRandomInt(1, 27), hour, minute, second);
        return date;
    }

}
