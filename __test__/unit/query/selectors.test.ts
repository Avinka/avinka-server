import {EsQueryBuilder} from '../../../lib/query/ESQueryBuilder';
import {Selector} from '../../../lib/query/selector';

test('convert equals selector to query', () => {
    const key = 'actor.name';
    const operator = '=';
    const value = 'person';
    const equalsSelector = new Selector(key, value, operator, new Date());
    expect(EsQueryBuilder.buildFromSelector(equalsSelector)).toEqual({
        'match': {
            'actor.name': 'person'
        }
    });
});

test('convert range selector to query', () => {
    const key = 'actor.age';
    const operator = '>';
    const value = '10';
    let gteSelector = new Selector(key, value, operator, new Date());

    expect(EsQueryBuilder.buildFromSelector(gteSelector)).toEqual({
        'range': {
            'actor.age': {
                'gt': '10'
            }
        }
    });
});
