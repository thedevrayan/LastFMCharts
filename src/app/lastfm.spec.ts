import { TestBed } from '@angular/core/testing';

import { LastfmService } from './lastfm.service';

describe('Lastfm', () => {
  let service: LastfmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastfmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
