import { Component, ElementRef, OnInit } from '@angular/core';
import { database, firestore } from 'firebase';
import { AuthData } from '../../../../services/auth.service';
import * as cjs from 'crypto-js';
import { Random } from '../../../../services/random.service';
import { Router } from '@angular/router';

export interface MessagesList {
    imgUrl: string;
    name: string;
    uid: string;
}

@Component({
    selector: 'app-messages-list',
    templateUrl: './messages-list.component.html',
    styleUrls: ['./messages-list.component.css']
})
export class MessagesListComponent implements OnInit {
    friends: any;
    friend: [{ imgUrl: string, name: string, uid: string, lastMsg: any, time: Number }];
    b: any;
    uid: string;
    messagesLoading = false;
    container: ElementRef;

    constructor(private hu: AuthData, private random: Random, private router: Router) {
        console.log(hu.heicsaUser.uId);
        if (hu.heicsaUser) {
            try {
                firestore().doc(`heicsa/${hu.heicsaUser.uId}/userdata/private/cdata/contactList`).get().then((result) => {
                    this.friends = Object.values(result.data());
                    console.log(result.data())
                    console.log(this.friends);
                    for (let i = 0; i < this.friends.length; i++) {
                        this.friendDetails(this.friends[i]).then((result: { imgUrl: string, name: string, uid: string, lastMsg: any, time: Number }) => {
                            if (this.friend == null) {
                                this.friend = [result];
                            } else {
                                this.friend.push(result);
                            }
                            if (i === (this.friends.length - 1)) {
                                localStorage.setItem('MessagesList', JSON.stringify(this.friend));
                            }
                        });
                    }
                });
            } catch (e) {
                console.log('From constructor ' + e.message)
            }
        }
    }

    encrypt(a: any): string {
        let encrptedData = cjs.AES.encrypt(JSON.stringify(a), this.random.setKey()).toString().replace(/\+/g, 'p1L2u3S').replace(/\//g, 's1L2a3S4h').replace(/=/g, 'e1Q2u3A4l');
        return encrptedData;
    }
    Fa26gsa(a: any) {
        this.router.navigateByUrl('messages/' + this.encrypt(a))
    }
    async friendDetails(a: string): Promise<{ imgUrl?: string, name: string, uid: string, lastMsg: any, time: Number }> {
        let dbData: { imgUrl?: string, name?: string, uid?: string };
        let mdbData: any;
        try {
            await database().ref(`usernames/${a}`).once('value', (snapshot) => {
                dbData = snapshot.val();
                console.log('This ' + snapshot.val())
            })
            await database()
                .ref(`/messages/${this.ucID(this.hu.heicsaUser.uId, dbData.uid)}`)
                .limitToLast(1)
                .once('value', (s) => {
                    if (s.val() == null) {
                        console.log('s.val() is null')
                        mdbData = [{
                            m: 'send a msg',
                            s: {
                                o: {
                                    s: true,
                                    I: 1
                                },
                                e: {
                                    d: false,
                                    s: false,
                                }
                            },
                            t: Date.now()
                        }]
                    } else {
                        mdbData = Object.values(s.val());
                    }
                })
            if (dbData.imgUrl == null) {
                dbData.imgUrl = 'assets/app/home/astronaut.png'
            }
            if (mdbData[0].m.length > 20) {
                mdbData[0].m = mdbData[0].m.slice(0, 20)
            }
            if (mdbData == null) {

            }
        } catch (error) {
            console.log(error.message)
        }
        return {
            imgUrl: dbData.imgUrl, name: dbData.name, uid: dbData.uid, lastMsg: mdbData[0].m, time: mdbData[0].t
        }
    }
    timeReturn(ts: any): string {
        var date_ob = new Date(ts);
        var hours = ("0" + date_ob.getHours()).slice(-2)
        var minutes = ("0" + date_ob.getMinutes()).slice(-2);
        var seconds = ("0" + date_ob.getSeconds()).slice(-2);
        return `${hours}:${minutes}`
    }
    ucID(a: string, b: string) {
        return (a > b) ? (a + '_' + b) : (b + '_' + a);
    }
    ngOnInit() {
    }
}
