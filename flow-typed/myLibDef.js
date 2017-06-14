declare type Action = {
    type: string,
    data: any
}

declare type DatabaseConfig = {
  host: string,
  actions: ?(action: Action, dbClient: any, cb: () => void)  => void,
  start: ?(cb: (db: any) => void) => void,
  clean: ?(dbClient: any, cb: () => void) => void;
};

declare type FindByName = {
    name: string
}

declare type FindById = {
    id: string
}

declare type FindQuery = FindByName | FindById;

declare type SendKeys = {
    given: string,
    find: FindQuery,
    event: 'sendKeys',
    value: string,
}

declare type ClickAction = {
    given: string,
    find: FindQuery,
    event: 'click',
}


declare type SendKeysWhen = {
    when: string,
    find: FindQuery,
    event: 'sendKeys',
    value: string
}

declare type ClickActionWhen = {
    when: string,
    find: FindQuery,
    event: 'click'
}

declare type UrlIs = {
    then: string,
    urlIs: string
}

declare type Given = SendKeys | ClickAction;

declare type When = SendKeysWhen | ClickActionWhen;

declare type Then = UrlIs;

// or test eventually
declare type Setup = Action | string

declare type Test = {
    setup: ?Setup[] | ?string,
    given: ?Given[],
    when: When,
    then: Then
}

declare type Tree = Test[];






